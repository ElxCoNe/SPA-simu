import { API_URL } from "./config";

// GET
export async function apiGet(path) {
    const res = await fetch(API_URL + path);
    if (!res.ok) throw new Error("Request failed");
    return res.json();
}

//POST
export async function apiPost(path, body) {
    const res = await fetch(API_URL + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
}

//PATHC
export async function apiPatch(path, body) {
    const res = await fetch(API_URL + path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
}

//DELETE
export async function apiDelete(path) {
    const res = await fetch(API_URL + path, { method: "DELETE" });
    if (!res.ok) throw new Error("Request failed");
    return true;
}
