// events-admin.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('editor')) return;

    const tableBody = document.getElementById('events-table-body');
    const modal = document.getElementById('events-modal');
    const form = document.getElementById('events-form');

    async function loadEvents() {
        try {
            const events = await window.api.get('/events?_sort=event_date&_order=asc');
            tableBody.innerHTML = events.map(e => `
                <tr>
                    <td><strong>${new Date(e.event_date).toDateString()}</strong></td>
                    <td>${window.sanitizeHTML(e.title)}</td>
                    <td><i class="fas fa-map-marker-alt" style="color:var(--gray-500)"></i> ${window.sanitizeHTML(e.location)}</td>
                    <td>
                        <span class="badge ${e.is_active ? 'badge-active' : 'badge-inactive'}">
                            ${e.is_active ? 'Active' : 'Closed'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="editEvent('${e.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete" onclick="deleteEvent('${e.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (err) { window.showToast('Load failed', 'error'); }
    }

    loadEvents();

    document.getElementById('add-btn').onclick = () => {
        form.reset();
        document.getElementById('event-id').value = '';
        document.getElementById('modal-title').textContent = 'Add New Event';
        modal.style.display = 'flex';
    };

    document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => modal.style.display = 'none');

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('event-id').value;
        const data = {
            title: document.getElementById('title').value,
            event_date: document.getElementById('event_date').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            is_active: document.getElementById('is_active').checked
        };

        try {
            if (id) {
                const old = await window.api.get(`/events/${id}`);
                await window.api.put(`/events/${id}`, data);
                await window.security.logAudit('UPDATE', 'events', id, old, data);
            } else {
                data.id = window.generateUUID();
                await window.api.post('/events', data);
                await window.security.logAudit('CREATE', 'events', data.id, null, data);
            }
            modal.style.display = 'none';
            window.showToast('Event saved');
            loadEvents();
        } catch (err) { window.showToast('Save failed', 'error'); }
    };

    window.editEvent = async (id) => {
        const e = await window.api.get(`/events/${id}`);
        document.getElementById('event-id').value = e.id;
        document.getElementById('title').value = e.title;
        document.getElementById('event_date').value = e.event_date;
        document.getElementById('location').value = e.location;
        document.getElementById('description').value = e.description;
        document.getElementById('is_active').checked = e.is_active;
        document.getElementById('modal-title').textContent = 'Edit Event';
        modal.style.display = 'flex';
    };

    window.deleteEvent = async (id) => {
        if (!confirm('Delete event?')) return;
        const old = await window.api.get(`/events/${id}`);
        await window.api.delete(`/events/${id}`);
        await window.security.logAudit('DELETE', 'events', id, old, null);
        window.showToast('Deleted');
        loadEvents();
    };
});
