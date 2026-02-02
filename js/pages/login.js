import { apiGet } from "../core/api.js";
import { saveSession, getSession } from "../core/storage.js";

const form = document.querySelector("#loginForm");

function redirectByRole(role) {
    if (role === "admin") {
        window.location.href = "./pages/admin-panel.html";
    } else {
        window.location.href = "./pages/events.html";
    }
}

// If user already logged in, redirect by role
const session = getSession();
if (session) {
    redirectByRole(session.role);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;

    if (!email || !password) {
        Swal.fire("Error", "Please fill all fields.", "error");
        return;
    }

    try {
        const users = await apiGet(
            `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );

        const user = users[0];

        if (!user) {
            Swal.fire("Error", "Wrong credentials.", "error");
            return;
        }

        saveSession(user);

        Swal.fire("Success", "Login successful!", "success").then(() => {
            redirectByRole(user.role);
        });
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Server error. Try again.", "error");
    }
});
