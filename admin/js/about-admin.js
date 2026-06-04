// about-admin.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('editor')) return;

    const form = document.getElementById('about-form');
    const imageInput = document.getElementById('image_file');
    const previewImg = document.getElementById('image-preview');

    async function loadAbout() {
        try {
            const [data] = await window.api.get('/about_campus');
            if (data) {
                document.getElementById('content').value = data.content;
                document.getElementById('image_url').value = data.image_url;
                previewImg.src = data.image_url;
                form.dataset.id = data.id;
            }
        } catch (e) { window.showToast('Load failed', 'error'); }
    }

    loadAbout();

    imageInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await window.security.validateFile(file);
            const reader = new FileReader();
            reader.onload = (re) => {
                previewImg.src = re.target.result;
                document.getElementById('image_url').value = re.target.result;
            };
            reader.readAsDataURL(file);
        } catch (err) { window.showToast(err.message, 'error'); }
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = form.dataset.id;
        const data = {
            content: document.getElementById('content').value,
            image_url: document.getElementById('image_url').value,
            updated_at: new Date().toISOString()
        };

        try {
            const old = await window.api.get(`/about_campus/${id}`);
            await window.api.put(`/about_campus/${id}`, data);
            await window.security.logAudit('UPDATE', 'about_campus', id, old, data);
            window.showToast('Section updated successfully');
        } catch (err) { window.showToast('Update failed', 'error'); }
    };
});
