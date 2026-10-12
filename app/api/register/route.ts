import bcryptjs from "bcryptjs";
import { NextResponse } from "next/server";
import * as z from "zod";

import { normaliseEmail, verifyRegistrationToken } from "@/lib/auth/registrationToken";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
    try {
        const { firstName, lastName, email: rawEmail, password, registrationToken } = await req.json();

        const result = registerSchema.safeParse({
            firstName,
            lastName,
            email: rawEmail,
            password,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 },
            );
        }

        const email = normaliseEmail(result.data.email);

        // The email must have passed OTP verification on the server
        if (!verifyRegistrationToken(registrationToken, email)) {
            return NextResponse.json(
                { error: "Please verify your email again before signing up." },
                { status: 403 },
            );
        }

        // Check if user already exists (any letter case)
        const existingUser = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            select: { id: true },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 },
            );
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });

        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Registration error:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: "An error occurred during registration" },
            { status: 500 },
        );
    }
}
