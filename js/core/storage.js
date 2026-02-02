import { SESSION_KEY } from "./config.js";

export function saveSession(user) {
    const session = { id: user.id, email: user.email, role: user.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
