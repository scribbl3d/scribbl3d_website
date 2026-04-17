import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { signIn } from "next-auth/react";

export const useAuthToast = () => {
    const showAuthToast = (action?: string) => {
        toast({
            title: "Authentication Required",
            description: `Please log in to ${action || "continue"}.`,
            variant: "destructive",
            action: (
                <ToastAction altText="Log in" onClick={() => signIn()}>
                    Log in
                </ToastAction>
            ),
        });
    };

    return { showAuthToast };
};
