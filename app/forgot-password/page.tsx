"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.isGoogleUser) {
          setIsGoogleUser(true);
          toast({
            title: "Google Account Detected",
            description:
              "Please use the 'Sign in with Google' option on the login page.",
          });
        } else {
          toast({
            title: "Reset Email Sent",
            description:
              "If an account exists with this email, you will receive password reset instructions.",
          });
        }
      } else {
        throw new Error(result.error || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-800">
            Forgot Password
          </CardTitle>
          <CardDescription>
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGoogleUser ? (
            <div className="text-center">
              <p className="mb-4">
                This email is associated with a Google account.
              </p>
              <p className="mb-4">
                Please use the Sign in with Google option on the login page.
              </p>
              <Button asChild variant="default" className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" className="text-sm" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
