// director-admin.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('editor')) return;

    const form = document.getElementById('director-form');
    const previewImg = document.getElementById('image-preview');

    async function loadDirector() {
        const [data] = await window.api.get('/campus_director');
        if (data) {
            document.getElementById('name').value = data.name;
            document.getElementById('designation').value = data.designation;
            document.getElementById('message').value = data.message;
            document.getElementById('contact_email').value = data.contact_email;
            document.getElementById('image_url').value = data.image_url;
            previewImg.src = data.image_url;
            form.dataset.id = data.id;
        }
    }

    loadDirector();

    document.getElementById('image_file').onchange = async (e) => {
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
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = form.dataset.id;
        const data = {
            name: document.getElementById('name').value,
            designation: document.getElementById('designation').value,
            message: document.getElementById('message').value,
            contact_email: document.getElementById('contact_email').value,
            image_url: document.getElementById('image_url').value,
            updated_at: new Date().toISOString()
        };

        try {
            const old = await window.api.get(`/campus_director/${id}`);
            await window.api.put(`/campus_director/${id}`, data);
            await window.security.logAudit('UPDATE', 'campus_director', id, old, data);
            window.showToast('Director profile updated');
        } catch (err) { window.showToast('Update failed', 'error'); }
    };
});
