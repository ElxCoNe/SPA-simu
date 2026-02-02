import { apiGet } from "../core/api.js";
import { clearSession } from "../core/storage.js";
import { requireRole } from "../core/guards.js";

requireRole("user");


const menuGrid = document.querySelector("#menuGrid");
const searchInput = document.querySelector("#searchInput");
const categoryFilters = document.querySelector("#categoryFilters");
const btnLogout = document.querySelector("#btnLogout");
const userInfo = document.querySelector("#userInfo");

let allEvents = [];
let activeFilter = "all";

btnLogout.addEventListener("click", () => {
    clearSession();
    window.location.href = "../index.html";
});

userInfo.textContent = `Logged as: ${session.email} (${session.role})`;

function todayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function applyFilters() {
    const text = searchInput.value.trim().toLowerCase();
    const today = todayStr();

    let filtered = allEvents;

    if (activeFilter === "today") filtered = filtered.filter(e => e.date === today);
    if (activeFilter === "upcoming") filtered = filtered.filter(e => e.date > today);
    if (activeFilter === "past") filtered = filtered.filter(e => e.date < today);

    if (text) {
        filtered = filtered.filter(e =>
            (e.title || "").toLowerCase().includes(text) ||
            (e.location || "").toLowerCase().includes(text)
        );
    }

    renderEvents(filtered);
}

function renderEvents(events) {
    menuGrid.innerHTML = "";

    if (!events.length) {
        menuGrid.innerHTML = `<p class="text-muted">No hay eventos.</p>`;
        return;
    }

    events.forEach((ev) => {
        const div = document.createElement("div");
        div.className = "col-12 col-md-6";
        div.innerHTML = `
      <div class="card border-0 shadow-sm rounded-4 h-100">
        <div class="card-body">
          <h5 class="fw-bold">${ev.title}</h5>
          <div class="text-muted small mb-2">${ev.date} • ${ev.location}</div>
          <p class="mb-2">${ev.description || ""}</p>
          <div class="small">Asistentes: <b>${ev.attendees}</b> / ${ev.capacity}</div>
        </div>
      </div>
    `;
        menuGrid.appendChild(div);
    });
}

categoryFilters.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-category]");
    if (!btn) return;

    document.querySelectorAll("#categoryFilters button").forEach(b => {
        b.classList.remove("pill-active", "btn-outline-dark");
        b.classList.add("btn-outline-secondary");
    });

    btn.classList.add("pill-active", "btn-outline-dark");
    btn.classList.remove("btn-outline-secondary");

    activeFilter = btn.dataset.category;
    applyFilters();
});

searchInput.addEventListener("input", applyFilters);

async function loadEvents() {
    try {
        allEvents = await apiGet("/events?_sort=date&_order=asc");
        applyFilters();
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar los eventos.", "error");
    }
}

loadEvents();
