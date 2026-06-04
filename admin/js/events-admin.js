// events-admin.js - Events CRUD

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('editor')) return;

    const tableBody = document.getElementById('events-table-body');
    const modal = document.getElementById('events-modal');
    const form = document.getElementById('events-form');
    const addBtn = document.getElementById('add-btn');

    async function loadEvents() {
        try {
            // Sort by date descending
            const events = await window.api.get('/events?_sort=event_date&_order=desc');
            renderTable(events);
        } catch (e) {
            window.showToast('Failed to load events', 'error');
        }
    }

    function renderTable(events) {
        tableBody.innerHTML = events.map(item => {
            const eventDate = new Date(item.event_date);
            const isPast = eventDate < new Date().setHours(0,0,0,0);
            
            return `
                <tr>
                    <td>
                        <strong>${eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                        ${isPast ? '<span class="badge" style="background:#f3f4f6; color:#6b7280; margin-left:5px;">Past</span>' : ''}
                    </td>
                    <td>${window.sanitizeHTML(item.title)}</td>
                    <td>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" style="margin-right:5px; vertical-align:middle;">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        ${item.location}
                    </td>
                    <td>
                        <span class="badge ${item.is_active ? 'badge-active' : 'badge-inactive'}">
                            ${item.is_active ? 'Active' : 'Hidden'}
                        </span>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" onclick="editEvent('${item.id}')">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit
                            </button>
                            <button class="btn-delete" onclick="deleteEvent('${item.id}')">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="5" style="text-align:center">No events found</td></tr>';
    }

    loadEvents();

    // Modal Control
    addBtn.onclick = () => {
        form.reset();
        document.getElementById('event-id').value = '';
        document.getElementById('modal-title').textContent = 'Add New Event';
        document.getElementById('event_date').value = new Date().toISOString().split('T')[0];
        modal.style.display = 'flex';
    };

    document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => modal.style.display = 'none');

    // Submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('event-id').value;
        const data = {
            title: document.getElementById('title').value,
            event_date: document.getElementById('event_date').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            is_active: document.getElementById('is_active').checked,
            updated_at: new Date().toISOString()
        };

        try {
            if (id) {
                const old = await window.api.get(`/events/${id}`);
                await window.api.put(`/events/${id}`, data);
                await window.security.logAudit('UPDATE', 'events', id, old, data);
            } else {
                data.id = window.generateUUID();
                data.created_at = new Date().toISOString();
                await window.api.post('/events', data);
                await window.security.logAudit('CREATE', 'events', data.id, null, data);
            }
            modal.style.display = 'none';
            window.showToast('Event saved successfully');
            loadEvents();
        } catch (err) {
            window.showToast('Error saving event', 'error');
        }
    };

    window.editEvent = async (id) => {
        try {
            const item = await window.api.get(`/events/${id}`);
            document.getElementById('event-id').value = item.id;
            document.getElementById('title').value = item.title;
            document.getElementById('event_date').value = item.event_date;
            document.getElementById('location').value = item.location;
            document.getElementById('description').value = item.description || '';
            document.getElementById('is_active').checked = item.is_active;
            document.getElementById('modal-title').textContent = 'Edit Event';
            modal.style.display = 'flex';
        } catch (e) {
            window.showToast('Failed to load event details', 'error');
        }
    };

    window.deleteEvent = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            const old = await window.api.get(`/events/${id}`);
            await window.api.delete(`/events/${id}`);
            await window.security.logAudit('DELETE', 'events', id, old, null);
            window.showToast('Event deleted');
            loadEvents();
        } catch (e) {
            window.showToast('Error deleting event', 'error');
        }
    };
});
