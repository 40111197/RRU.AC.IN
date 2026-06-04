async function initNews() {
    const container = document.getElementById('news-announcements');
    try {
        const newsList = await window.api.get('/news?is_active=true&_sort=display_order&_order=asc&_limit=5');
        
        container.innerHTML = `
            <div class="news-card">
                <div class="news-card-header">
                    <div class="header-icon"><i class="fas fa-calendar-alt"></i></div>
                    <h3>News &amp; Announcements</h3>
                </div>
                <div class="news-list">
                    ${newsList.map(item => `
                        <div class="news-item">
                            <span class="badge-recent">${window.sanitizeHTML(item.tag)}</span>
                            <a href="#">${window.sanitizeHTML(item.title)}</a>
                        </div>
                    `).join('')}
                </div>
                <button class="news-view-all-btn">View All &gt;</button>
            </div>
        `;
    } catch (e) {
        console.error('News load failed', e);
    }
}
