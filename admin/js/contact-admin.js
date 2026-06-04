// contact-admin.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('editor')) return;

    const form = document.getElementById('contact-form');

    async function loadContact() {
        const [data] = await window.api.get('/contact_details');
        if (data) {
            document.getElementById('email').value = data.email;
            document.getElementById('phone').value = data.phone;
            document.getElementById('location').value = data.location;
            form.dataset.id = data.id;
        }
    }

    loadContact();

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = form.dataset.id;
        const data = {
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            updated_at: new Date().toISOString()
        };

        try {
            const old = await window.api.get(`/contact_details/${id}`);
            await window.api.put(`/contact_details/${id}`, data);
            await window.security.logAudit('UPDATE', 'contact_details', id, old, data);
            window.showToast('Contact info updated');
        } catch (err) { window.showToast('Update failed', 'error'); }
    };
});
