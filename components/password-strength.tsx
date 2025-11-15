import { useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange: (strength: number) => void;
}

export function PasswordStrengthMeter({
  password,
  onStrengthChange,
}: PasswordStrengthMeterProps) {
  useEffect(() => {
    const calculateStrength = () => {
      let strength = 0;
      const safePassword = password || "";

      // Length check
      if (safePassword.length >= 8) strength += 20;
      if (safePassword.length >= 12) strength += 10;

      // Character type checks
      if (/[A-Z]/.test(safePassword)) strength += 20;
      if (/[a-z]/.test(safePassword)) strength += 20;
      if (/[0-9]/.test(safePassword)) strength += 20;
      if (/[^A-Za-z0-9]/.test(safePassword)) strength += 20;

      // Cap at 100
      strength = Math.min(strength, 100);

      onStrengthChange(strength);
    };

    calculateStrength();
  }, [password, onStrengthChange]);

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-red-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-2">
      <Progress
        value={password ? 100 : 0}
        className={`h-2 ${getStrengthColor(password ? 100 : 0)}`}
      />
      <p className="text-xs text-gray-500">
        {!password
          ? "Enter a password"
          : password.length < 8
          ? "Password is too short"
          : "Password strength: " + (password ? "Strong" : "Weak")}
      </p>
    </div>
  );
}
