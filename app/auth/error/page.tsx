"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") ?? null;

  useEffect(() => {
    // Log the error for debugging purposes
    if (error) {
      console.error("Authentication error:", error);
    }
  }, [error]);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "email_exists":
        return (
          <div className="space-y-4">
            <p>
              An account with this email already exists. This could be due to
              one of the following situations:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                You have previously created an account using email and password.
              </li>
              <li>You have previously signed up using Google Sign-In.</li>
            </ol>
            <p>Here s what you can do:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                If you remember creating an account with email and password, try
                signing in using those credentials.
              </li>
              <li>
                If you think you ve used Google Sign-In before, try signing in
                with Google.
              </li>
              <li>
                If you re unsure, try resetting your password using the Forgot
                Password option on the login page.
              </li>
            </ul>
          </div>
        );
      default:
        return "An unexpected error occurred during authentication. Please try again or contact support if the problem persists.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription>
            There was a problem with your sign-in attempt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">{getErrorMessage(error)}</div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild variant="default" className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login?provider=google">Sign In with Google</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/forgot-password">Forgot Password</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
