import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    const result = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
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
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
