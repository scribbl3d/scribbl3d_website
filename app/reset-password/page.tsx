"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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
import { PasswordStrengthMeter } from "../register/_components/password-strength";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<null | boolean>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchPassword = watch("password");
  const watchConfirmPassword = watch("confirmPassword");
  const passwordsMatch =
    watchPassword === watchConfirmPassword && !!watchPassword;

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsValidToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid reset token",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Password Reset Successful",
          description:
            "Your password has been reset. You can now log in with your new password.",
        });
        router.push("/login");
      } else {
        setErrorMessage(result.error || "Failed to reset password");
        throw new Error(result.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error:", error);
      if (!errorMessage) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An error occurred while resetting your password. Please try again."
        );
      }
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while resetting your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-800">
              Verifying Link…
            </CardTitle>
            <CardDescription>
              Checking your password reset link…
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-solid"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">
              Invalid or Expired Token
            </CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              Please request a new password reset link.
            </p>
            <Button asChild variant="default" className="w-full">
              <Link href="/forgot-password">Request New Link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-800">
            Reset Password
          </CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md mb-2">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="New password"
                {...register("password")}
                disabled={isLoading}
              />
              <PasswordStrengthMeter
                password={watchPassword || ""}
                onStrengthChange={setPasswordStrength}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
              {!errors.confirmPassword &&
                watchConfirmPassword &&
                !passwordsMatch && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || passwordStrength < 80 || !passwordsMatch}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
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
