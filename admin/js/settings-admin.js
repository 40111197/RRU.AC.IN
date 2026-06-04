// settings-admin.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('superadmin')) return;

    const tableBody = document.getElementById('settings-table-body');
    const modal = document.getElementById('settings-modal');
    const form = document.getElementById('settings-form');

    async function loadSettings() {
        try {
            const settings = await window.api.get('/site_settings');
            tableBody.innerHTML = settings.map(s => `
                <tr>
                    <td><strong>${s.key}</strong></td>
                    <td style="max-width: 400px; overflow: hidden; text-overflow: ellipsis;">
                        ${window.sanitizeHTML(s.value)}
                    </td>
                    <td>
                        <button class="btn-inline-edit" onclick="editSetting('${s.id}')">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (e) { window.showToast('Load failed', 'error'); }
    }

    loadSettings();

    document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => modal.style.display = 'none');

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('setting-id').value;
        const value = document.getElementById('setting-value').value;
        
        // SSRF Check for URLs (OWASP A10)
        if (value.startsWith('http') && !window.security.validateURL(value)) {
            window.showToast('Security Error: URL domain not allowed (SSRF Protection).', 'error');
            return;
        }

        try {
            const old = await window.api.get(`/site_settings/${id}`);
            const data = { ...old, value };
            
            await window.api.put(`/site_settings/${id}`, data);
            await window.security.logAudit('UPDATE', 'site_settings', id, old, data);
            
            modal.style.display = 'none';
            window.showToast('Setting updated');
            loadSettings();
        } catch (err) { window.showToast('Save failed', 'error'); }
    }

    window.editSetting = async (id) => {
        const s = await window.api.get(`/site_settings/${id}`);
        document.getElementById('setting-id').value = s.id;
        document.getElementById('setting-key-label').textContent = s.key;
        document.getElementById('setting-value').value = s.value;
        
        const isUrl = s.key.toLowerCase().includes('url');
        document.getElementById('ssrf-hint').style.display = isUrl ? 'block' : 'none';
        
        modal.style.display = 'flex';
    };
});
