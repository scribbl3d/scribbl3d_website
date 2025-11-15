import { useState, useEffect } from "react";
// import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (strength: number) => void;
}

export function PasswordStrengthMeter({
  password,
  onStrengthChange,
}: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0);
  const [label, setLabel] = useState("");
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    const calculateStrength = () => {
      let newStrength = 0;
      const newRequirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
      };

      if (newRequirements.length) newStrength += 20;
      if (newRequirements.uppercase) newStrength += 20;
      if (newRequirements.lowercase) newStrength += 20;
      if (newRequirements.number) newStrength += 20;
      if (newRequirements.special) newStrength += 20;

      setStrength(newStrength);
      setRequirements(newRequirements);

      if (newStrength <= 20) setLabel("Very Weak");
      else if (newStrength <= 40) setLabel("Weak");
      else if (newStrength <= 60) setLabel("Medium");
      else if (newStrength <= 80) setLabel("Strong");
      else setLabel("Very Strong");

      if (onStrengthChange) {
        onStrengthChange(newStrength);
      }
    };

    calculateStrength();
  }, [password, onStrengthChange]);

  const getProgressStyles = () => {
    const baseStyles = "h-2 transition-all duration-500";

    if (strength <= 20) {
      return cn(baseStyles, "bg-gradient-to-r from-red-200 to-red-400");
    }
    if (strength <= 40) {
      return cn(baseStyles, "bg-gradient-to-r from-orange-200 to-orange-400");
    }
    if (strength <= 60) {
      return cn(baseStyles, "bg-gradient-to-r from-yellow-200 to-yellow-400");
    }
    if (strength <= 80) {
      return cn(baseStyles, "bg-gradient-to-r from-blue-200 to-blue-400");
    }
    return cn(baseStyles, "bg-gradient-to-r from-emerald-300 to-emerald-500");
  };

  const getLabelColor = () => {
    if (strength <= 20) return "text-red-500";
    if (strength <= 40) return "text-orange-500";
    if (strength <= 60) return "text-yellow-600";
    if (strength <= 80) return "text-blue-500";
    return "text-emerald-500";
  };

  return (
    <div className="space-y-2">
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(getProgressStyles(), "rounded-full")}
          style={{ width: `${strength}%` }}
        />
      </div>
      <p className="text-sm font-medium">
        Password strength:{" "}
        <span className={cn("font-semibold", getLabelColor())}>{label}</span>
      </p>
      <ul className="text-sm space-y-1">
        {Object.entries(requirements).map(([key, met]) => (
          <li
            key={key}
            className={cn(
              "flex items-center gap-2",
              met ? "text-emerald-600" : "text-gray-600"
            )}
          >
            <Check
              size={16}
              className={cn(
                "transition-opacity",
                met ? "opacity-100" : "opacity-0"
              )}
            />
            {key === "length" && "At least 8 characters long"}
            {key === "uppercase" && "Contains uppercase letter"}
            {key === "lowercase" && "Contains lowercase letter"}
            {key === "number" && "Contains number"}
            {key === "special" && "Contains special character"}
          </li>
        ))}
      </ul>
    </div>
  );
}
