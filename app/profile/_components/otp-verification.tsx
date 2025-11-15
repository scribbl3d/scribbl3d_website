import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface OTPVerificationProps {
  email: string;
  onVerified: (otp: string) => void;
  resendOTP: () => void;
}

export default function OTPVerification({
  email,
  onVerified,
  resendOTP,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onVerified(otp);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await resendOTP();
      toast.success("New OTP sent successfully");
    } catch (err) {
      console.error("Failed to resend OTP:", err);
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleCopyOTP = async () => {
    try {
      await navigator.clipboard.writeText(otp);
      toast.success("OTP copied to clipboard");
    } catch (err) {
      console.error("Failed to copy OTP:", err);
      toast.error("Failed to copy OTP");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Verify Your Action
        </CardTitle>
        <CardDescription className="text-center">
          We&apos;ve sent a 6-digit code to{" "}
          <span className="font-medium text-gray-900">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                value={otp}
                onChange={handleOTPChange}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono h-14"
              />
              {otp && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleCopyOTP}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              disabled={isResending}
              onClick={handleResendOTP}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isResending ? "animate-spin" : ""}`}
              />
              {isResending ? "Sending..." : "Resend OTP"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
