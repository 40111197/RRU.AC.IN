// dashboard.js - Stats and recent activity logic

document.addEventListener('DOMContentLoaded', async () => {
    // Only run if on dashboard page
    if (!window.location.pathname.includes('dashboard.html')) return;

    const statNews = document.getElementById('stat-news');
    const statEvents = document.getElementById('stat-events');
    const statGallery = document.getElementById('stat-gallery');
    const statUsers = document.getElementById('stat-users');
    const recentAuditBody = document.getElementById('recent-audit-body');
    const currentDate = document.getElementById('current-date');

    // 1. Set Date
    currentDate.textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // 2. Fetch Stats
    const fetchStat = async (url, element) => {
        try {
            const data = await window.api.get(url);
            element.textContent = Array.isArray(data) ? data.length : 0;
        } catch (e) {
            console.error(`Stat load failed for ${url}`, e);
            element.textContent = '--';
        }
    };

    fetchStat('/news', statNews);
    fetchStat('/events', statEvents);
    fetchStat('/gallery', statGallery);
    fetchStat('/users?is_active=true', statUsers);

    // 3. Fetch Recent Audit Logs
    try {
        const logs = await window.api.get('/audit_logs?_sort=timestamp&_order=desc&_limit=10');
        recentAuditBody.innerHTML = logs.map(log => `
            <tr>
                <td><strong>${window.sanitizeHTML(log.username)}</strong></td>
                <td><span class="badge-${log.action.toLowerCase()}">${log.action}</span></td>
                <td>${log.table_name}</td>
                <td style="font-size:0.75rem; color:var(--gray-500)">
                    ${new Date(log.timestamp).toLocaleString()}
                </td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center">No recent activity</td></tr>';
    } catch (e) {
        console.error('Logs load failed', e);
    }
});
