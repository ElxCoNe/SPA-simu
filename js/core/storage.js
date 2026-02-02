import { SESSION_KEY } from "./config.js";

export function saveSession(user) {
    const session = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
