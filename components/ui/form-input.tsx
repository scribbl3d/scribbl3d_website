"use client";

import { ReactNode } from "react";

interface FormInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "text" | "email" | "tel" | "password" | "number";
    maxLength?: number;
    required?: boolean;
    optional?: boolean;
    error?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
    rightElement?: ReactNode;
}

export function FormInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    maxLength,
    required = false,
    optional = false,
    error,
    disabled = false,
    autoFocus = false,
    className = "",
    rightElement,
}: FormInputProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-semibold text-gray-600 mb-2 sm:mb-1.5 uppercase tracking-wide">
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                    {optional && (
                        <span className="text-gray-400 normal-case font-normal">
                            (optional)
                        </span>
                    )}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    className={`w-full px-3.5 sm:px-3 py-3 sm:py-2.5 rounded-lg border ${error ? "border-red-300" : "border-gray-200"} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:focus:ring-gray-900 transition ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1.5 sm:mt-1">{error}</p>}
        </div>
    );
}

interface FormTextareaProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    required?: boolean;
    optional?: boolean;
    error?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    showCharCount?: boolean;
    className?: string;
}

export function FormTextarea({
    label,
    value,
    onChange,
    placeholder,
    rows = 4,
    maxLength,
    required = false,
    optional = false,
    error,
    disabled = false,
    autoFocus = false,
    showCharCount = true,
    className = "",
}: FormTextareaProps) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = maxLength
            ? e.target.value.slice(0, maxLength)
            : e.target.value;
        onChange(newValue);
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                    {optional && (
                        <span className="text-gray-400 normal-case font-normal">
                            (optional)
                        </span>
                    )}
                </label>
            )}
            <textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                autoFocus={autoFocus}
                className={`w-full px-3 py-2.5 rounded-lg border ${error ? "border-red-300" : "border-gray-200"} ${disabled ? "bg-gray-100" : "bg-gray-50"} text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 resize-none ${disabled ? "cursor-not-allowed" : ""}`}
            />
            {(error || (showCharCount && maxLength)) && (
                <div className="flex justify-between items-center mt-1">
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    {showCharCount && maxLength && (
                        <p className="text-[11px] text-gray-400 ml-auto">
                            {value.length}/{maxLength}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
