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
                        <button class="btn-icon edit" onclick="editSetting('${s.id}')"><i class="fas fa-edit"></i></button>
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
