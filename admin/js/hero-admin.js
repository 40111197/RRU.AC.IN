// hero-admin.js - CRUD for Hero Slides

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('admin')) return;

    const tableBody = document.getElementById('hero-table-body');
    const modal = document.getElementById('hero-modal');
    const form = document.getElementById('hero-form');
    const addBtn = document.getElementById('add-btn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const imageInput = document.getElementById('image_file');
    const previewImg = document.getElementById('image-preview');

    // 1. Initial Load
    async function loadHeroSlides() {
        try {
            const slides = await window.api.get('/hero_slides?_sort=display_order&_order=asc');
            tableBody.innerHTML = slides.map(slide => `
                <tr>
                    <td><img src="${slide.image_url}" class="thumbnail" alt="Thumb"></td>
                    <td><strong>${window.sanitizeHTML(slide.title)}</strong></td>
                    <td>${slide.display_order}</td>
                    <td>
                        <span class="badge ${slide.is_active ? 'badge-active' : 'badge-inactive'}">
                            ${slide.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="editSlide('${slide.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete" onclick="deleteSlide('${slide.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            window.showToast('Failed to load slides', 'error');
        }
    }

    loadHeroSlides();

    // 2. Modal Logic
    addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('hero-id').value = '';
        document.getElementById('modal-title').textContent = 'Add New Slide';
        previewImg.src = '';
        modal.style.display = 'flex';
    });

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.style.display = 'none';
    }));

    // 3. Image Handling & Validation (OWASP A08)
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await window.security.validateFile(file);
            
            // Mock Upload (since json-server can't handle files)
            // In a real app, this would be a FormData POST to a server
            const reader = new FileReader();
            reader.onload = (re) => {
                const dataUrl = re.target.result;
                previewImg.src = dataUrl;
                document.getElementById('image_url').value = dataUrl;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            window.showToast(err.message, 'error');
            imageInput.value = '';
        }
    });

    // 4. Form Submit (CREATE/UPDATE)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('hero-id').value;
        const data = {
            title: document.getElementById('title').value,
            subtitle: document.getElementById('subtitle').value,
            display_order: parseInt(document.getElementById('display_order').value),
            is_active: document.getElementById('is_active').checked,
            image_url: document.getElementById('image_url').value || previewImg.src,
            updated_at: new Date().toISOString()
        };

        try {
            if (id) {
                // Fetch old data for audit log
                const oldData = await window.api.get(`/hero_slides/${id}`);
                await window.api.put(`/hero_slides/${id}`, data);
                await window.security.logAudit('UPDATE', 'hero_slides', id, oldData, data);
            } else {
                data.id = window.generateUUID();
                data.created_at = new Date().toISOString();
                await window.api.post('/hero_slides', data);
                await window.security.logAudit('CREATE', 'hero_slides', data.id, null, data);
            }
            
            modal.style.display = 'none';
            window.showToast('Slide saved successfully!');
            loadHeroSlides();
        } catch (err) {
            window.showToast('Save failed', 'error');
        }
    });

    // Global exposed functions for onclick
    window.editSlide = async (id) => {
        try {
            const slide = await window.api.get(`/hero_slides/${id}`);
            document.getElementById('hero-id').value = slide.id;
            document.getElementById('title').value = slide.title;
            document.getElementById('subtitle').value = slide.subtitle;
            document.getElementById('display_order').value = slide.display_order;
            document.getElementById('is_active').checked = slide.is_active;
            document.getElementById('image_url').value = slide.image_url;
            previewImg.src = slide.image_url;
            
            document.getElementById('modal-title').textContent = 'Edit Slide';
            modal.style.display = 'flex';
        } catch (e) {
            window.showToast('Error loading slide data', 'error');
        }
    };

    window.deleteSlide = async (id) => {
        if (!confirm('Are you sure you want to delete this slide?')) return;
        
        try {
            const oldData = await window.api.get(`/hero_slides/${id}`);
            await window.api.delete(`/hero_slides/${id}`);
            await window.security.logAudit('DELETE', 'hero_slides', id, oldData, null);
            window.showToast('Slide deleted');
            loadHeroSlides();
        } catch (e) {
            window.showToast('Delete failed', 'error');
        }
    };
});
