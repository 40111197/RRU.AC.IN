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
                        <div class="action-btns">
                            <button class="btn-edit" onclick="editNews('${item.id}')">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit
                            </button>
                            <button class="btn-delete" onclick="deleteNews('${item.id}')">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                                Delete
                            </button>
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
