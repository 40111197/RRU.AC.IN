// login-history-admin.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('superadmin')) return;

    const tableBody = document.getElementById('history-table-body');

    try {
        const history = await window.api.get('/login_history?_sort=timestamp&_order=desc');
        tableBody.innerHTML = history.map(row => `
            <tr>
                <td style="font-size:0.8rem; color:var(--gray-500)">${new Date(row.timestamp).toLocaleString()}</td>
                <td><strong>${window.sanitizeHTML(row.email)}</strong></td>
                <td>
                    <span class="badge ${row.status === 'success' ? 'badge-active' : 'badge-inactive'}">
                        ${row.status.toUpperCase()}
                    </span>
                </td>
                <td style="font-size:0.7rem; opacity:0.7; max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
                    ${row.user_agent}
                </td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center">No attempts logged</td></tr>';
    } catch (e) { window.showToast('Load failed', 'error'); }
});
