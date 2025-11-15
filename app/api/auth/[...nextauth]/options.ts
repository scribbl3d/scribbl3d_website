import { NextAuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { CustomPrismaAdapter } from "@/lib/auth/prismaAdapter";

const prisma = new PrismaClient();

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
        try {
          const result = loginSchema.safeParse(credentials);

          if (!result.success) {
            console.error("Validation error:", result.error.errors);
            return null;
          }

          const { email, password } = result.data;

          const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, password: true },
          });

          if (!user) {
            console.error("User not found");
            return null;
          }

          if (user.password.startsWith("google_")) {
            throw new Error(
              "This account uses Google authentication. Please sign in with Google."
            );
          }

          const isPasswordValid = await bcryptjs.compare(
            password,
            user.password
          );

          if (!isPasswordValid) {
            console.error("Invalid password");
            return null;
          }

          return { id: user.id, email: user.email, name: user.name };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      if (account && account.provider === "google") {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // First check for existing account
          const existingAccount = await prisma.account.findFirst({
            where: {
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
            include: { user: true },
          });

          if (existingAccount) {
            // If account exists, return the associated user
            user.id = existingAccount.user.id;
            return true;
          }

          // Check for user with same email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            // Link the Google account to existing user
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

          // Create new user and account
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
                  providerAccountId: account.providerAccountId,
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
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
  },
  events: {
    // async signIn({ user, account, profile }) {
    //   // This event is now handled in the signIn callback
    // },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
