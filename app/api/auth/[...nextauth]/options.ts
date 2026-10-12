import { CustomPrismaAdapter } from "@/lib/auth/prismaAdapter";

import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { clientIpFrom } from "@/lib/api-helpers";
import { normaliseEmail } from "@/lib/auth/registrationToken";
import { checkLoginAttempts, recordFailedLogin, resetLoginAttempts } from "@/lib/login-rate-limit";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

let dummyHash: string | null = null;
const dummyPasswordHash = () => (dummyHash ??= bcryptjs.hashSync(crypto.randomBytes(16).toString("hex"), 10));

/** Client IP from the request NextAuth passes to authorize() */
function clientIp(req: { headers?: Record<string, any> } | undefined): string {
    return clientIpFrom((name) => {
        const value = req?.headers?.[name];
        return Array.isArray(value) ? value.join(",") : value;
    });
}

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: CustomPrismaAdapter(),

    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    },

    pages: {
        signIn: "/login",
        error: "/auth/error",
    },

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                const result = loginSchema.safeParse(credentials);
                if (!result.success) {
                    throw new Error("INVALID_INPUT");
                }

                const email = normaliseEmail(result.data.email);
                const { password } = result.data;

                // Brute-force limits: failures per account+client (with
                // backoff), plus a looser cap per client (shared mobile IPs)
                const ip = clientIp(req as any);
                const emailKey = `customer:${email}:${ip}`;
                const check = checkLoginAttempts(emailKey);
                if (!check.allowed) {
                    throw new Error(`TOO_MANY_ATTEMPTS:${check.lockoutTimeRemaining ?? 5}`);
                }
                for (const limited of [
                    await rateLimit(`login:ip:${ip}`, 30, 15 * 60 * 1000),
                    // Caps guessing one account from many IPs
                    await rateLimit(`login:email:${email}`, 20, 15 * 60 * 1000),
                ]) {
                    if (!limited.success) {
                        throw new Error(`TOO_MANY_ATTEMPTS:${Math.max(1, Math.ceil((limited.reset - Date.now()) / 60000))}`);
                    }
                }

                const user = await prisma.user.findFirst({
                    where: { email: { equals: email, mode: "insensitive" } },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        password: true,
                    },
                });

                // One generic error for a missing account, a Google-only
                // account or a wrong password (no account enumeration)
                const hasPassword =
                    !!user?.password && !user.password.startsWith("google_");
                // Always run bcrypt so response time doesn't reveal the account
                const matches = await bcryptjs.compare(
                    password,
                    hasPassword ? user!.password : dummyPasswordHash(),
                );
                const isValid = hasPassword && matches;
                if (!user || !isValid) {
                    recordFailedLogin(emailKey);
                    throw new Error("INVALID_CREDENTIALS");
                }

                resetLoginAttempts(emailKey);
                return { id: user.id, email: user.email, name: user.name };
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },

        // Resolve the user by the ID in the token, never by email: after an
        // email change, a lookup by email could fail (id undefined matches
        // every row in Prisma) or find someone else.
        async session({ session, token }) {
            if (!token?.id || !session.user) return session;

            session.user.id = token.id;
            const dbUser = await prisma.user.findUnique({
                where: { id: token.id },
                select: { name: true, email: true, image: true },
            });

            if (dbUser) {
                session.user.name = dbUser.name;
                session.user.email = dbUser.email;
                session.user.image = dbUser.image;
            }

            return session;
        },

        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                // Only Google-verified addresses may sign in or link
                if ((profile as { email_verified?: boolean } | undefined)?.email_verified === false) {
                    return false;
                }
                try {
                    if (user.email && user.image) {
                        await prisma.user.updateMany({
                            where: {
                                email: user.email,
                                image: null,
                            },
                            data: {
                                image: user.image,
                            },
                        });
                    }

                    const existingAccount = await prisma.account.findFirst({
                        where: {
                            provider: "google",
                            providerAccountId: account.providerAccountId,
                        },
                        include: { user: true },
                    });

                    if (existingAccount) {
                        user.id = existingAccount.user.id;
                        return true;
                    }

                    const existingUser = await prisma.user.findFirst({
                        where: { email: { equals: user.email!, mode: "insensitive" } },
                    });

                    if (existingUser) {
                        // A password set without proving the inbox (older sign-ups,
                        // or a squatter pre-registering this email) must not keep
                        // access once the real owner signs in with Google.
                        if (!existingUser.emailVerified) {
                            await prisma.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    emailVerified: new Date(),
                                    password: `google_${crypto.randomBytes(20).toString("hex")}`,
                                },
                            });
                        }

                        await prisma.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                access_token: account.access_token,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                            },
                        });

                        user.id = existingUser.id;
                        return true;
                    }

                    const newUser = await prisma.user.create({
                        data: {
                            name: user.name!,
                            email: user.email!,
                            image: user.image,
                            password: `google_${crypto.randomBytes(20).toString("hex")}`,
                            emailVerified: new Date(),
                            accounts: {
                                create: {
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId:
                                        account.providerAccountId,
                                    access_token: account.access_token,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                },
                            },
                        },
                    });

                    user.id = newUser.id;
                    return true;
                } catch (error) {
                    console.error("Google sign-in error:", error instanceof Error ? error.message : error);
                    return false;
                }
            }

            return true;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};
