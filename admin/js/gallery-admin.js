// gallery-admin.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('admin')) return;

    const grid = document.getElementById('gallery-grid');
    const uploadInput = document.getElementById('bulk-upload');

    async function loadGallery() {
        try {
            const items = await window.api.get('/gallery?_sort=display_order&_order=asc');
            grid.innerHTML = items.map(item => `
                <div class="gallery-card">
                    <div class="card-actions">
                        <button class="action-btn del" onclick="deleteItem('${item.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                    <img src="${item.image_url}" alt="Gallery">
                    <div class="gallery-card-info">
                        <input type="text" value="${window.sanitizeHTML(item.caption)}" 
                               onchange="updateCaption('${item.id}', this.value)"
                               placeholder="Add caption...">
                    </div>
                </div>
            `).join('');
        } catch (e) { window.showToast('Load failed', 'error'); }
    }

    loadGallery();

    // Bulk Upload with Security Checks (OWASP A08)
    uploadInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        window.showToast(`Validating ${files.length} files...`, 'info');

        for (const file of files) {
            try {
                // 1. Magic Byte Validation
                await window.security.validateFile(file);

                // 2. Mock processing
                const reader = new FileReader();
                reader.onload = async (re) => {
                    const newItem = {
                        id: window.generateUUID(),
                        image_url: re.target.result,
                        caption: file.name.split('.')[0],
                        display_order: 99,
                        is_active: true,
                        created_at: new Date().toISOString()
                    };
                    await window.api.post('/gallery', newItem);
                    await window.security.logAudit('CREATE', 'gallery', newItem.id, null, newItem);
                    loadGallery();
                };
                reader.readAsDataURL(file);
            } catch (err) {
                window.showToast(`Skip ${file.name}: ${err.message}`, 'error');
            }
        }
        uploadInput.value = '';
    });

    window.updateCaption = async (id, newCaption) => {
        try {
            const old = await window.api.get(`/gallery/${id}`);
            const data = { ...old, caption: newCaption };
            await window.api.put(`/gallery/${id}`, data);
            await window.security.logAudit('UPDATE', 'gallery', id, old, data);
            window.showToast('Caption updated');
        } catch (e) { window.showToast('Update failed', 'error'); }
    };

    window.deleteItem = async (id) => {
        if (!confirm('Remove this image?')) return;
        try {
            const old = await window.api.get(`/gallery/${id}`);
            await window.api.delete(`/gallery/${id}`);
            await window.security.logAudit('DELETE', 'gallery', id, old, null);
            window.showToast('Image removed');
            loadGallery();
        } catch (e) { window.showToast('Delete failed', 'error'); }
    };
});
