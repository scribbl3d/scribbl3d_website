"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl";
    showClose?: boolean;
    closeOnOverlayClick?: boolean;
    mobileFullscreen?: boolean;
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
};

export function Modal({
    isOpen,
    onClose,
    children,
    className = "",
    maxWidth = "md",
    showClose = true,
    closeOnOverlayClick = true,
    mobileFullscreen = false,
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (closeOnOverlayClick) {
            onClose();
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex ${mobileFullscreen ? "items-end sm:items-center" : "items-center"} justify-center bg-black/50 p-0 ${mobileFullscreen ? "sm:p-4" : "p-4"}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`bg-white ${mobileFullscreen ? "rounded-t-2xl sm:rounded-2xl max-h-[90vh] sm:max-h-[85vh]" : "rounded-2xl max-h-[90vh]"} w-full ${maxWidthClasses[maxWidth]} ${className} flex flex-col overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                {showClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                {children}
            </div>
        </div>
    );
}

interface ModalHeaderProps {
    children: ReactNode;
    className?: string;
}

export function ModalHeader({ children, className = "" }: ModalHeaderProps) {
    return (
        <div className={`p-5 pb-3 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    );
}

interface ModalBodyProps {
    children: ReactNode;
    className?: string;
}

export function ModalBody({ children, className = "" }: ModalBodyProps) {
    return <div className={`p-5 overflow-y-auto ${className}`}>{children}</div>;
}

interface ModalFooterProps {
    children: ReactNode;
    className?: string;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
    return (
        <div className={`p-5 pt-3 border-t border-gray-100 ${className}`}>
            {children}
        </div>
    );
}
