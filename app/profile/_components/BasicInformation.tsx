"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

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
      console.log("Saving name:", name);
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
          <Label htmlFor="email">Email</Label>
          <div className="text-sm text-muted-foreground mt-1">{userEmail}</div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              {isEditingName ? (
                <div className="flex space-x-2">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="max-w-[300px]"
                  />
                  <Button onClick={handleNameSave}>Save</Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditingName(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-muted-foreground">{name}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Pencil className="h-4 w-4" />
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
