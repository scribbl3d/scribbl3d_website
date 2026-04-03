import { CustomPrismaAdapter } from "@/lib/auth/prismaAdapter";

import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

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
            async authorize(credentials) {
                const result = loginSchema.safeParse(credentials);
                if (!result.success) {
                    throw new Error("INVALID_INPUT");
                }

                const { email, password } = result.data;

                const user = await prisma.user.findUnique({
                    where: { email },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        password: true,
                    },
                });

                // No account found with this email
                if (!user) {
                    throw new Error("NO_ACCOUNT");
                }

                // Account exists but was created via Google OAuth
                if (!user.password || user.password.startsWith("google_")) {
                    throw new Error("GOOGLE_ACCOUNT");
                }

                // Wrong password
                const isValid = await bcryptjs.compare(password, user.password);
                if (!isValid) {
                    throw new Error("WRONG_PASSWORD");
                }

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

        async session({ session }) {
            if (!session.user?.email) return session;

            const dbUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true, name: true, image: true },
            });

            if (dbUser) {
                session.user.id = dbUser.id;
                session.user.name = dbUser.name;
                session.user.image = dbUser.image;
            }

            return session;
        },

        async signIn({ user, account }) {
            if (account?.provider === "google") {
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

                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                    });

                    if (existingUser) {
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
                    console.error("Google sign-in error:", error);
                    return false;
                }
            }

            return true;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};
