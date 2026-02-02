import { apiGet, apiPost, apiPatch, apiDelete } from "../core/api.js";
import { clearSession } from "../core/storage.js";
import { requireRole } from "../core/guards.js";

requireRole("admin", "../index.html");

const btnLogout = document.querySelector("#btnLogout");
const btnCreateEvent = document.querySelector("#btnCreateEvent");
const eventsTbody = document.querySelector("#eventsTbody");

const modalEl = document.querySelector("#eventModal");
const modal = new bootstrap.Modal(modalEl);

const modalTitle = document.querySelector("#modalTitle");
const form = document.querySelector("#eventForm");
const formError = document.querySelector("#formError");

const eventId = document.querySelector("#eventId");
const titleInput = document.querySelector("#title");
const dateInput = document.querySelector("#date");
const locationInput = document.querySelector("#location");
const capacityInput = document.querySelector("#capacity");
const attendeesInput = document.querySelector("#attendees");
const descriptionInput = document.querySelector("#description");

btnLogout.addEventListener("click", () => {
    clearSession();
    window.location.href = "../index.html";
});

btnCreateEvent.addEventListener("click", () => {
    openCreateModal();
});

eventsTbody.addEventListener("click", (e) => {
    const editBtn = e.target.closest("button[data-edit]");
    const deleteBtn = e.target.closest("button[data-delete]");

    if (editBtn) {
        const id = editBtn.dataset.edit;
        openEditModal(id);
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.delete;
        handleDelete(id);
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.textContent = "";

    const data = {
        title: titleInput.value.trim(),
        date: dateInput.value,
        location: locationInput.value.trim(),
        capacity: Number(capacityInput.value),
        attendees: Number(attendeesInput.value),
        description: descriptionInput.value.trim()
    };

    const errorMsg = validateEvent(data);
    if (errorMsg) {
        formError.textContent = errorMsg;
        return;
    }

    try {
        if (eventId.value) {
            await apiPatch(`/events/${eventId.value}`, data);
            Swal.fire("OK", "Evento actualizado.", "success");
        } else {
            await apiPost("/events", data);
            Swal.fire("OK", "Evento creado.", "success");
        }

        modal.hide();
        await loadEvents();
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Server error.", "error");
    }
});

function validateEvent(data) {
    if (!data.title) return "Title is required.";
    if (!data.date) return "Date is required.";
    if (!data.location) return "Location is required.";

    if (!Number.isInteger(data.capacity) || data.capacity <= 0) return "Capacity must be > 0.";
    if (!Number.isInteger(data.attendees) || data.attendees < 0) return "Attendees must be >= 0.";
    if (data.attendees > data.capacity) return "Attendees cannot exceed capacity.";

    return "";
}

function openCreateModal() {
    modalTitle.textContent = "New event";
    form.reset();
    eventId.value = "";
    attendeesInput.value = 0;
    formError.textContent = "";
    modal.show();
}

async function openEditModal(id) {
    try {
        const ev = await apiGet(`/events/${id}`);

        modalTitle.textContent = "Edit event";
        eventId.value = ev.id;
        titleInput.value = ev.title || "";
        dateInput.value = ev.date || "";
        locationInput.value = ev.location || "";
        capacityInput.value = ev.capacity ?? 1;
        attendeesInput.value = ev.attendees ?? 0;
        descriptionInput.value = ev.description || "";

        formError.textContent = "";
        modal.show();
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not load event.", "error");
    }
}

async function handleDelete(id) {
    const result = await Swal.fire({
        title: "¿Eliminar evento?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
        await apiDelete(`/events/${id}`);
        Swal.fire("OK", "Evento eliminado.", "success");
        await loadEvents();
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not delete event.", "error");
    }
}

async function loadEvents() {
    try {
        const events = await apiGet("/events?_sort=date&_order=asc");
        renderEvents(events);
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not load events.", "error");
    }
}

function renderEvents(events) {
    eventsTbody.innerHTML = "";

    if (!events.length) {
        eventsTbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-muted">No events found.</td>
      </tr>
    `;
        return;
    }

    events.forEach((ev) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${ev.id}</td>
      <td>${escapeHtml(ev.title)}</td>
      <td>${ev.date}</td>
      <td>${escapeHtml(ev.location)}</td>
      <td class="text-truncate" style="max-width: 260px;">${escapeHtml(ev.description || "")}</td>
      <td>${ev.capacity}</td>
      <td>${ev.attendees}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-warning" data-edit="${ev.id}">Edit</button>
        <button class="btn btn-sm btn-danger" data-delete="${ev.id}">Delete</button>
      </td>
    `;
        eventsTbody.appendChild(tr);
    });
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadEvents();
