// audit-logs-admin.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('superadmin')) return;

    const tableBody = document.getElementById('logs-table-body');
    const searchInput = document.getElementById('log-search');
    const actionFilter = document.getElementById('action-filter');

    async function loadLogs() {
        let url = '/audit_logs?_sort=timestamp&_order=desc';
        const search = searchInput.value;
        const action = actionFilter.value;
        
        if (search) url += `&q=${search}`;
        if (action) url += `&action=${action}`;

        try {
            const logs = await window.api.get(url);
            tableBody.innerHTML = logs.map(log => `
                <tr>
                    <td style="font-size:0.8rem; color:var(--gray-500)">${new Date(log.timestamp).toLocaleString()}</td>
                    <td><strong>${window.sanitizeHTML(log.username)}</strong></td>
                    <td><span class="badge badge-${log.action.toLowerCase()}">${log.action}</span></td>
                    <td><code style="background:var(--gray-100); padding:2px 4px; border-radius:4px">${log.table_name}</code></td>
                    <td>
                        <button class="btn btn-text" onclick="viewLogDiff('${log.id}')" style="font-size:0.75rem; color:var(--navy)">View Details</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center">No logs found</td></tr>';
        } catch (e) { window.showToast('Load failed', 'error'); }
    }

    loadLogs();
    
    searchInput.oninput = () => loadLogs();
    actionFilter.onchange = () => loadLogs();

    window.viewLogDiff = async (id) => {
        const log = await window.api.get(`/audit_logs/${id}`);
        const details = `
            Action: ${log.action}
            Table: ${log.table_name}
            User: ${log.username}
            Time: ${log.timestamp}
            
            NEW DATA:
            ${JSON.stringify(log.new_data, null, 2)}
            
            OLD DATA:
            ${JSON.stringify(log.old_data, null, 2)}
        `;
        alert(details); 
    };

    document.getElementById('export-csv').onclick = () => {
        window.showToast('CSV Exporting... (Mocked)', 'info');
    };
});
