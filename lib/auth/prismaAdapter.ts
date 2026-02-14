import { PrismaAdapter } from "@auth/prisma-adapter";

import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { Adapter, AdapterAccount, AdapterUser } from "next-auth/adapters";

import { prisma } from "@/lib/prisma";

// Define the type for the user data
interface CreateUserData {
    name?: string | null;
    email: string;
    emailVerified?: Date | null;
    image?: string | null;
}

export function CustomPrismaAdapter(): Adapter {
    return {
        ...PrismaAdapter(prisma),
        createUser: async (data: CreateUserData): Promise<AdapterUser> => {
            console.log("Creating user with data:", data);
            try {
                // Generate a secure placeholder password for new users
                const placeholderPassword = `google_${crypto
                    .randomBytes(20)
                    .toString("hex")}`;
                const hashedPassword = await bcryptjs.hash(
                    placeholderPassword,
                    10,
                );

                const user = await prisma.user.create({
                    data: {
                        ...data,
                        password: hashedPassword,
                    },
                });
                console.log("User created successfully:", user);
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email!, // Use non-null assertion as we know email is required
                    emailVerified: user.emailVerified,
                    image: user.image,
                };
            } catch (error) {
                console.error("Error creating user:", error);
                throw error;
            }
        },
        linkAccount: async (data: AdapterAccount): Promise<AdapterAccount> => {
            console.log("Linking account:", data);
            try {
                const account = await prisma.account.create({
                    data: {
                        ...data,
                        type: data.type as "oauth" | "email" | "oidc", // Cast to the expected type
                        access_token: data.access_token ?? null,
                        token_type: data.token_type ?? null,
                        id_token: data.id_token ?? null,
                        refresh_token: data.refresh_token ?? null,
                        scope: data.scope ?? null,
                        expires_at: data.expires_at ?? null,
                        session_state: data.session_state ?? null,
                    },
                });
                console.log("Account linked successfully:", account);
                return account as AdapterAccount; // Cast to AdapterAccount to ensure type compatibility
            } catch (error) {
                console.error("Error linking account:", error);
                throw error;
            }
        },
        getUserByAccount: async (
            provider_providerAccountId: Pick<
                AdapterAccount,
                "provider" | "providerAccountId"
            >,
        ): Promise<AdapterUser | null> => {
            try {
                const account = await prisma.account.findUnique({
                    where: {
                        provider_providerAccountId,
                    },
                    include: {
                        user: true,
                    },
                });
                if (account?.user) {
                    return {
                        id: account.user.id,
                        name: account.user.name,
                        email: account.user.email!, // Use non-null assertion as we expect email to be present
                        emailVerified: account.user.emailVerified,
                        image: account.user.image,
                    };
                }
                return null;
            } catch (error) {
                console.error("Error getting user by account:", error);
                throw error;
            }
        },
    };
}
