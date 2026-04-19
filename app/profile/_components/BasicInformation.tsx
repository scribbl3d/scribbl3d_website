"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { AnimatePresence } from "framer-motion";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface BasicInformationProps {
    user: {
        name: string | null;
        email: string;
    };
}

export function BasicInformation({ user }: BasicInformationProps) {
    const [name, setName] = useState(user.name || "");
    const [isEditingName, setIsEditingName] = useState(false);
    const [userEmail] = useState(user.email);

    const handleNameSave = async () => {
        try {
            setIsEditingName(false);
            toast({
                title: "Name Updated",
                description: "Your name has been updated successfully.",
            });
        } catch (error) {
            console.error("Error saving name:", error);
            toast({
                title: "Error",
                description: "Failed to update name. Please try again.",
                variant: "destructive",
            });
        }
    };

    const renderEmailChangeContent = () => {
        // Only show static email, no edit button or flow
        return (
            <div className="flex items-center">
                <div>
                    <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
                    <div className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                        {userEmail}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-base md:text-lg">Basic Information</CardTitle>
                <CardDescription className="text-xs md:text-sm">Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 md:space-y-1">
                            <Label htmlFor="name" className="text-xs md:text-sm">Name</Label>
                            {isEditingName ? (
                                <div className="flex space-x-1.5 md:space-x-2">
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className="max-w-[200px] md:max-w-[300px] text-xs md:text-sm h-8 md:h-10"
                                    />
                                    <Button onClick={handleNameSave} className="text-xs md:text-sm h-8 md:h-10 px-3 md:px-4">
                                        Save
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsEditingName(false)}
                                        className="text-xs md:text-sm h-8 md:h-10 px-3 md:px-4"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-1.5 md:space-x-2">
                                    <div className="text-xs md:text-sm text-muted-foreground">
                                        {name}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditingName(true)}
                                        className="h-7 md:h-8 w-7 md:w-8 p-0"
                                    >
                                        <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <AnimatePresence mode="wait">
                        {renderEmailChangeContent()}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
