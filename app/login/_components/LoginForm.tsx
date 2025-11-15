"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
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
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "@/hooks/useActionState";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { error, isLoading, setError, setLoading } = useActionState<void>();
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/profile";
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setSuccess("Registration successful! Please log in.");
    }
    const error = searchParams?.get("error");
    if (error) {
      switch (error) {
        case "OAuthAccountNotLinked":
          toast({
            title: "Account Created",
            description:
              "Your Google account has been created. Please sign in again.",
            duration: 5000,
          });
          break;
        case "CredentialsSignin":
          setError("Invalid email or password");
          break;
        default:
          setError("An error occurred. Please try again.");
      }
    }
  }, [searchParams, setError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (result?.error) {
        console.error("Login error:", result.error);
        setError("Invalid email or password");
      } else if (result?.ok) {
        console.log("Login successful");
        setIsRedirecting(true);
        router.push(callbackUrl);
      } else {
        console.error("Unexpected login result:", result);
        setError("An unexpected error occurred");
      }
    } catch (error) {
      console.error("An unexpected error happened:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 pt-[100px] sm:pt-[100px] px-4 sm:px-0">
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid"></div>
          <span className="ml-4 text-blue-800 text-lg font-semibold">
            Redirecting...
          </span>
        </div>
      )}
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl px-2 py-4 sm:px-6 sm:py-8">
        <CardHeader className="space-y-1 px-2 sm:px-4">
          <CardTitle className="text-3xl font-bold text-blue-800 break-words">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-blue-600 break-words">
            Bring your digital designs to life, one layer at a time
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 px-2 sm:px-4">
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-blue-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
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
                className="text-sm font-medium text-blue-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
            </div>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md break-words">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing In..."
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>
        </CardContent>
        <p className="text-xs text-center text-blue-600 pb-[7px] px-2 sm:px-4 break-words">
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
        <CardFooter className="flex flex-col space-y-2 px-2 sm:px-4">
          <Button asChild variant="link" className="text-sm text-blue-600">
            <Link href="/forgot-password">Forgot password?</Link>
          </Button>
          <p className="text-sm text-center text-blue-600 w-full break-words">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-800 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
