// gallery-admin.js - Gallery Manager

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('editor')) return;

    const galleryGrid = document.getElementById('gallery-grid');
    const bulkUpload = document.getElementById('bulk-upload');

    async function loadGallery() {
        try {
            const images = await window.api.get('/gallery');
            renderGallery(images);
        } catch (e) {
            window.showToast('Failed to load gallery', 'error');
        }
    }

    function renderGallery(images) {
        galleryGrid.innerHTML = images.map(img => `
            <div class="gallery-card" data-id="${img.id}">
                <div class="action-btns" style="position:absolute; top:10px; right:10px; z-index:5;">
                    <button class="btn-delete" onclick="deleteImage('${img.id}')" style="padding:6px; min-width:auto; display:flex; align-items:center; gap:4px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                        Delete
                    </button>
                </div>
                <img src="${img.url}" alt="${img.title || ''}" onerror="this.src='https://via.placeholder.com/300x200?text=Error+Loading+Image'">
                <div class="gallery-card-info">
                    <input type="text" value="${img.title || ''}" placeholder="Enter title..." onchange="updateTitle('${img.id}', this.value)">
                </div>
            </div>
        `).join('') || '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:var(--gray-500);">No images in gallery</div>';
    }

    loadGallery();
    
    // Bridge new button ID to hidden input
    const uploadTrigger = document.getElementById('upload-trigger');
    if (uploadTrigger) {
        uploadTrigger.onclick = () => bulkUpload.click();
    }

    // Bulk Upload Handlers
    bulkUpload.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        window.showToast(`Processing ${files.length} images...`, 'info');

        for (const file of files) {
            const base64 = await convertToBase64(file);
            const data = {
                id: window.generateUUID(),
                url: base64,
                title: file.name.split('.')[0],
                created_at: new Date().toISOString()
            };

            try {
                await window.api.post('/gallery', data);
                await window.security.logAudit('CREATE', 'gallery', data.id, null, { title: data.title });
            } catch (err) {
                window.showToast(`Failed to upload ${file.name}`, 'error');
            }
        }

        window.showToast('Upload complete');
        loadGallery();
        bulkUpload.value = ''; // Reset
    };

    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    window.updateTitle = async (id, newTitle) => {
        try {
            const old = await window.api.get(`/gallery/${id}`);
            const data = { ...old, title: newTitle, updated_at: new Date().toISOString() };
            await window.api.put(`/gallery/${id}`, data);
            window.showToast('Title updated');
        } catch (e) {
            window.showToast('Failed to update title', 'error');
        }
    };

    window.deleteImage = async (id) => {
        if (!confirm('Permanently delete this image?')) return;
        try {
            const old = await window.api.get(`/gallery/${id}`);
            await window.api.delete(`/gallery/${id}`);
            await window.security.logAudit('DELETE', 'gallery', id, old, null);
            window.showToast('Image deleted');
            loadGallery();
        } catch (e) {
            window.showToast('Error deleting image', 'error');
        }
    };
});
