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
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="editUser('${u.id}')"><i class="fas fa-edit"></i></button>
                            ${u.id !== currentAdminId ? `
                                <button class="btn-icon delete" onclick="deleteUser('${u.id}')"><i class="fas fa-trash"></i></button>
                            ` : ''}
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
