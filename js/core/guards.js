import { getSession } from "./storage.js";

export function requireAuth(redirectTo = "../index.html") {
    const session = getSession();

    if (!session) {
        window.location.href = redirectTo;
        return null;
    }

    return session; // null o session
}

export function requireRole(role, redirectTo = "../index.html") {
    const session = requireAuth(redirectTo);

    if (!session || session.role !== role) {
        window.location.href = redirectTo;
        return null;
    }

    return session;
}

// [=]'' -> by my cat