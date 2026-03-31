import { getSession } from "./session";

export type Role = "user" | "admin";

const roleHierarchy: Record<Role, Role[]> = {
    user: ["user"],
    admin: ["user", "admin"],
};

export async function authorizeUser(requiredRole?: Role) {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }

    if (requiredRole) {
        const userRole = (session.role as Role) || "user";
        if (!roleHierarchy[userRole]?.includes(requiredRole)) {
            throw new Error("Insufficient permissions");
        }
    }

    return session;
}

type AsyncFunction<T extends unknown[], R> = (...args: T) => Promise<R>;

export function withAuth<T extends unknown[], R>(
    handler: AsyncFunction<T, R>,
    requiredRole?: Role,
): AsyncFunction<T, R> {
    return async (...args: T): Promise<R> => {
        await authorizeUser(requiredRole);
        return handler(...args);
    };
}

// Add this function for admin authentication
export async function authenticateAdmin(email: string, password: string) {
    // In a real application, you would fetch the admin from a database
    const validEmail =
        process.env.ADMIN_EMAIL || "ops-tracking-dashb-7fe3@scribbl3d.com";
    const validPassword = process.env.ADMIN_PASSWORD || "Scrf*_5934*#";

    if (email === validEmail && password === validPassword) {
        return { email, role: "admin" };
    }

    return null;
}
