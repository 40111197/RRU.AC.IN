// users-admin.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('superadmin')) return;

    const tableBody = document.getElementById('users-table-body');
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    const currentAdminId = window.auth.getLoggedInUser().id;

    async function loadUsers() {
        try {
            const users = await window.api.get('/users');
            tableBody.innerHTML = users.map(u => `
                <tr>
                    <td><strong>${window.sanitizeHTML(u.username)}</strong></td>
                    <td>${window.sanitizeHTML(u.email)}</td>
                    <td><span class="role-badge" style="background:#4338ca; color:white">${u.role}</span></td>
                    <td>
                        <span class="badge ${u.is_active ? 'badge-active' : 'badge-inactive'}">
                            ${u.is_active ? 'Active' : 'Disabled'}
                        </span>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" onclick="editUser('${u.id}')">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit Role
                            </button>
                            ${u.id !== currentAdminId ? `
                                <button class="btn-delete" onclick="deleteUser('${u.id}')">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                    </svg>
                                    Delete
                                </button>
                            ` : '<span style="color:#94a3b8;font-size:12px">Current User</span>'}
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (e) { window.showToast('Load failed', 'error'); }
    }

    loadUsers();

    document.getElementById('add-user-btn').onclick = () => {
        form.reset();
        document.getElementById('user-id').value = '';
        document.getElementById('modal-title').textContent = 'Create New User';
        document.getElementById('password').required = true;
        modal.style.display = 'flex';
    };

    document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => modal.style.display = 'none');

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const password = document.getElementById('password').value;
        
        const data = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            is_active: document.getElementById('is_active').checked,
            updated_at: new Date().toISOString()
        };

        if (password) {
            data.password = CryptoJS.SHA256(password).toString();
        }

        try {
            if (id) {
                const old = await window.api.get(`/users/${id}`);
                await window.api.patch(`/users/${id}`, data);
                await window.security.logAudit('UPDATE', 'users', id, old, { ...data, password: '***' });
            } else {
                data.id = window.generateUUID();
                data.created_at = new Date().toISOString();
                await window.api.post('/users', data);
                await window.security.logAudit('CREATE', 'users', data.id, null, { ...data, password: '***' });
            }
            modal.style.display = 'none';
            window.showToast('User saved');
            loadUsers();
        } catch (err) { window.showToast('Save failed', 'error'); }
    };

    window.editUser = async (id) => {
        const u = await window.api.get(`/users/${id}`);
        document.getElementById('user-id').value = u.id;
        document.getElementById('username').value = u.username;
        document.getElementById('email').value = u.email;
        document.getElementById('role').value = u.role;
        document.getElementById('is_active').checked = u.is_active;
        document.getElementById('password').required = false;
        document.getElementById('modal-title').textContent = 'Edit User';
        modal.style.display = 'flex';
    };

    window.deleteUser = async (id) => {
        if (!confirm('Delete user account?')) return;
        const old = await window.api.get(`/users/${id}`);
        await window.api.delete(`/users/${id}`);
        await window.security.logAudit('DELETE', 'users', id, old, null);
        window.showToast('User deleted');
        loadUsers();
    };
});
