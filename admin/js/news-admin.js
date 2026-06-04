// news-admin.js - News CRUD

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('editor')) return;

    const tableBody = document.getElementById('news-table-body');
    const modal = document.getElementById('news-modal');
    const form = document.getElementById('news-form');
    const addBtn = document.getElementById('add-btn');

    async function loadNews() {
        try {
            const news = await window.api.get('/news?_sort=display_order&_order=asc');
            renderTable(news);
        } catch (e) {
            window.showToast('Failed to load news', 'error');
        }
    }

    function renderTable(news) {
        tableBody.innerHTML = news.map(item => `
            <tr>
                <td><strong>${window.sanitizeHTML(item.title)}</strong></td>
                <td><span class="badge" style="background:#e0f2fe; color:#0369a1">${item.tag}</span></td>
                <td>${item.display_order}</td>
                <td>
                    <span class="badge ${item.is_active ? 'badge-active' : 'badge-inactive'}">
                        ${item.is_active ? 'Active' : 'Hidden'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" onclick="editNews('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete" onclick="deleteNews('${item.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadNews();

    // Modal Control
    addBtn.onclick = () => {
        form.reset();
        document.getElementById('news-id').value = '';
        document.getElementById('modal-title').textContent = 'Create News Post';
        modal.style.display = 'flex';
    };

    document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => modal.style.display = 'none');

    // Submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('news-id').value;
        const data = {
            title: document.getElementById('title').value,
            tag: document.getElementById('tag').value,
            display_order: parseInt(document.getElementById('display_order').value),
            is_active: document.getElementById('is_active').checked,
            updated_at: new Date().toISOString()
        };

        try {
            if (id) {
                const old = await window.api.get(`/news/${id}`);
                await window.api.put(`/news/${id}`, data);
                await window.security.logAudit('UPDATE', 'news', id, old, data);
            } else {
                data.id = window.generateUUID();
                data.created_at = new Date().toISOString();
                await window.api.post('/news', data);
                await window.security.logAudit('CREATE', 'news', data.id, null, data);
            }
            modal.style.display = 'none';
            window.showToast('News saved');
            loadNews();
        } catch (err) {
            window.showToast('Error saving news', 'error');
        }
    };

    window.editNews = async (id) => {
        const item = await window.api.get(`/news/${id}`);
        document.getElementById('news-id').value = item.id;
        document.getElementById('title').value = item.title;
        document.getElementById('tag').value = item.tag;
        document.getElementById('display_order').value = item.display_order;
        document.getElementById('is_active').checked = item.is_active;
        document.getElementById('modal-title').textContent = 'Edit News';
        modal.style.display = 'flex';
    };

    window.deleteNews = async (id) => {
        if (!confirm('Permanent delete?')) return;
        const old = await window.api.get(`/news/${id}`);
        await window.api.delete(`/news/${id}`);
        await window.security.logAudit('DELETE', 'news', id, old, null);
        window.showToast('Deleted');
        loadNews();
    };
});
