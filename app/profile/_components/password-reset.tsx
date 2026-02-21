import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function PasswordReset() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleResetPassword = () => {
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match");
            return;
        }
        // Here you would typically call an API to reset the password
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reset Password</h3>
            <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            <Button onClick={handleResetPassword}>Reset Password</Button>
        </div>
    );
}
