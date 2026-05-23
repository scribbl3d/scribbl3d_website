// ─────────────────────────────────────────────────
// lib/validation.ts
// Shared validation & sanitization for all form APIs
// ─────────────────────────────────────────────────

// ─── XSS / Injection Prevention ───

/** Strip HTML tags, script content, and dangerous characters from a string */
export function sanitize(input: unknown): string {
    if (input === null || input === undefined) return "";
    const str = String(input);
    return str
        // Remove script tags and their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Remove style tags and their content
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        // Remove all HTML tags
        .replace(/<[^>]*>/g, "")
        // Neutralize HTML entities used for injection
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        // Remove null bytes
        .replace(/\0/g, "")
        .trim();
}

/** Sanitize a string and enforce a max length */
export function sanitizeWithLimit(input: unknown, maxLength: number): string {
    return sanitize(input).slice(0, maxLength);
}

/** Sanitize or return null (for optional fields) */
export function sanitizeOptional(input: unknown, maxLength = 1000): string | null {
    if (input === null || input === undefined || String(input).trim() === "") return null;
    return sanitizeWithLimit(input, maxLength);
}

// ─── Email Validation ───

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: unknown): boolean {
    if (typeof email !== "string") return false;
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length === 0 || trimmed.length > 254) return false;
    return EMAIL_REGEX.test(trimmed);
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

// ─── Phone Validation ───

/** Validate Indian phone number (10 digits, optionally prefixed with +91 or 0) */
export function isValidPhone(phone: unknown): boolean {
    if (typeof phone !== "string") return false;
    const digits = phone.replace(/[\s\-()]/g, "").replace(/^\+\d{1,3}/, "").replace(/^0/, "");
    return /^\d{10}$/.test(digits);
}

/** Clean phone to digits only (10 digit Indian format) */
export function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "").slice(-10);
}

// ─── Required Fields ───

interface FieldSpec {
    value: unknown;
    name: string;
}

/** Returns an error message if any required fields are missing, or null if all valid */
export function checkRequired(fields: FieldSpec[]): string | null {
    const missing = fields.filter(
        (f) => f.value === null || f.value === undefined || (typeof f.value === "string" && f.value.trim() === "")
    );
    if (missing.length === 0) return null;
    return `Missing required fields: ${missing.map((f) => f.name).join(", ")}`;
}

// ─── Safe JSON Parse ───

/** Parse JSON safely, returns fallback on failure (prevents injection via malformed JSON) */
export function safeJsonParse<T>(input: unknown, fallback: T): T {
    if (typeof input !== "string") return fallback;
    try {
        return JSON.parse(input) as T;
    } catch {
        return fallback;
    }
}

// ─── String Array Sanitization ───

/** Sanitize an array of strings (e.g. colors, categories) */
export function sanitizeStringArray(input: unknown, maxItems = 20, maxItemLength = 200): string[] {
    if (!Array.isArray(input)) return [];
    return input
        .slice(0, maxItems)
        .filter((item) => typeof item === "string" && item.trim() !== "")
        .map((item) => sanitizeWithLimit(item, maxItemLength));
}

// ─── File Validation ───

const ALLOWED_DESIGN_EXTENSIONS = [
    ".stl", ".step", ".stp", ".obj", ".3mf", ".iges", ".igs",
    ".fbx", ".dxf", ".dwg", ".pdf", ".zip", ".rar", ".7z",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function isValidDesignFile(file: File): { valid: boolean; error?: string } {
    if (file.size === 0) return { valid: false, error: "File is empty" };
    if (file.size > MAX_FILE_SIZE) return { valid: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };

    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
    if (ext && !ALLOWED_DESIGN_EXTENSIONS.includes(ext)) {
        return { valid: false, error: `File type "${ext}" not allowed` };
    }

    return { valid: true };
}

// ─── Rate Limit Helper (simple per-IP) ───

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, maxRequests = 10, windowMs = 60_000): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
        return false;
    }

    entry.count++;
    if (entry.count > maxRequests) return true;
    return false;
}
