"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import { PasswordStrengthMeter } from "./_components/password-strength";
import OTPVerification from "./_components/otp-verification";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
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
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [registrationData, setRegistrationData] =
    useState<RegisterFormData | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchPassword = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const emailCheckResponse = await fetch("/api/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const emailCheckResult = await emailCheckResponse.json();

      if (emailCheckResult.exists) {
        setError("This email is already registered. Please sign in instead.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (result.success) {
        setShowOTP(true);
        setRegistrationData(data);
      } else {
        setError(result.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("An unexpected error happened:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!registrationData) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: registrationData.email }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("An unexpected error happened:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPVerified = async () => {
    if (!registrationData) {
      setError("Registration data is missing");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const responseData = await response.json();

      if (response.ok) {
        router.push("/login?registered=true");
      } else {
        if (responseData.error === "User already exists") {
          setShowOTP(false);
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(responseData.error || "An error occurred during registration");
        }
      }
    } catch (error) {
      console.error("An unexpected error happened:", error);
      setError("An unexpected error occurred");
    }
  };

  if (showOTP && registrationData) {
    return (
      <OTPVerification
        email={registrationData.email}
        onVerified={onOTPVerified}
        resendOTP={resendOTP}
      />
    );
  }

  const isPasswordStrong = passwordStrength > 80;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 pt-[100px] sm:pt-[100px] px-4 sm:px-0 pb-6">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-2xl border-0 px-2 py-4 sm:px-6 sm:py-8 mb-6">
        <CardHeader className="space-y-1 px-2 sm:px-4">
          <CardTitle className="text-3xl font-bold text-blue-800 break-words">
            Join Our Community
          </CardTitle>
          <CardDescription className="text-blue-600 break-words">
            Create your account and start your eco-friendly journey
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-blue-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <div className="relative">
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    {...register("firstName")}
                    disabled={isLoading}
                    className="pl-10 bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-500 break-words">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-blue-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
                <div className="relative">
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    {...register("lastName")}
                    disabled={isLoading}
                    className="pl-10 bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-red-500 break-words">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-blue-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  {...register("email")}
                  disabled={isLoading}
                  className="pl-10 bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 break-words">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-blue-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  {...register("password")}
                  disabled={isLoading}
                  className="pl-10 pr-10 bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 break-words">
                  {errors.password.message}
                </p>
              )}
              <PasswordStrengthMeter
                password={watchPassword || ""}
                onStrengthChange={setPasswordStrength}
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md break-words">
                {error}
                {error.includes("already registered") && (
                  <Link
                    href="/login"
                    className="block mt-2 text-blue-700 hover:text-blue-900 font-semibold underline"
                  >
                    Go to Login Page →
                  </Link>
                )}
              </div>
            )}
            <p className="text-xs text-center text-blue-600 px-2 sm:px-4 break-words">
              By continuing, you accept the{" "}
              <Link
                href="/terms-conditions"
                className="text-blue-800 hover:underline"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-blue-800 hover:underline"
              >
                Privacy Statement
              </Link>
              .
            </p>
            <div className="space-y-2">
              <Button
                type="submit"
                className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 ${
                  !isPasswordStrong
                    ? "opacity-50 cursor-not-allowed filter blur-[0.5px]"
                    : ""
                }`}
                disabled={isLoading || !isPasswordStrong}
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </>
                )}
              </Button>
              {!isPasswordStrong && (
                <p className="text-sm text-blue-600 text-center break-words">
                  Please create a strong password to enable sign-up
                </p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="px-2 sm:px-4">
          <p className="text-sm text-center text-blue-600 w-full break-words">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-800 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
