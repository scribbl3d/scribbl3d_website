import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { PasswordStrengthMeter } from "./password-strength";
import { AnimatedCard } from "./AnimatedCard";

enum PasswordChangeStep {
  Initial,
  EnterCurrentPassword,
  EnterNewPassword,
}

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeStep, setPasswordChangeStep] =
    useState<PasswordChangeStep>(PasswordChangeStep.Initial);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCurrentPasswordSubmit = async () => {
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/profile/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: currentPassword }),
      });

      if (response.ok) {
        setPasswordChangeStep(PasswordChangeStep.EnterNewPassword);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Invalid password");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Invalid password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setPasswordChangeStep(PasswordChangeStep.Initial);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordChangeContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={passwordChangeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            switch (passwordChangeStep) {
              case PasswordChangeStep.Initial:
                return (
                  <Button
                    onClick={() =>
                      setPasswordChangeStep(
                        PasswordChangeStep.EnterCurrentPassword
                      )
                    }
                    className="text-xs md:text-sm h-9 md:h-10"
                  >
                    Change Password
                  </Button>
                );
              case PasswordChangeStep.EnterCurrentPassword:
                return (
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="current-password" className="text-xs md:text-sm">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-10 text-xs md:text-sm h-9 md:h-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-0"
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handleCurrentPasswordSubmit}
                      disabled={isLoading}
                      className="text-xs md:text-sm h-9 md:h-10"
                    >
                      {isLoading ? "Verifying..." : "Verify Current Password"}
                    </Button>
                  </div>
                );
              case PasswordChangeStep.EnterNewPassword:
                return (
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="new-password" className="text-xs md:text-sm">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-10 text-xs md:text-sm h-9 md:h-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-0"
                          tabIndex={-1}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          )}
                        </button>
                      </div>
                      <PasswordStrengthMeter
                        password={newPassword}
                        onStrengthChange={setPasswordStrength}
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="confirm-password" className="text-xs md:text-sm">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-10 text-xs md:text-sm h-9 md:h-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-0"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                      <Button
                        onClick={handleChangePassword}
                        disabled={
                          isLoading ||
                          !newPassword ||
                          !confirmPassword ||
                          newPassword !== confirmPassword ||
                          passwordStrength < 80
                        }
                        className="text-xs md:text-sm h-9 md:h-10"
                      >
                        {isLoading ? "Changing..." : "Change Password"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setPasswordChangeStep(PasswordChangeStep.Initial)
                        }
                        className="text-xs md:text-sm h-9 md:h-10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <AnimatedCard
      title="Security Settings"
      description="Update your password and security preferences"
    >
      {renderPasswordChangeContent()}
    </AnimatedCard>
  );
}
