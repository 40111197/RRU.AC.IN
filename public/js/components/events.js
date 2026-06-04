async function initEvents() {
    const container = document.getElementById('events');
    try {
        const events = await window.api.get('/events?is_active=true&_limit=4');
        
        container.innerHTML = `
            <div class="container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px">
                    <h2 class="section-title" style="color:white">Upcoming Events</h2>
                    <button class="btn btn-orange">View Calendar</button>
                </div>
                <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
                    ${events.map(event => {
                        const date = new Date(event.event_date);
                        return `
                            <div class="event-card">
                                <div class="event-date">${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}</div>
                                <h3 style="margin:10px 0">${window.sanitizeHTML(event.title)}</h3>
                                <div style="font-size:0.85rem; opacity:0.8">
                                    <i class="fas fa-map-marker-alt"></i> ${window.sanitizeHTML(event.location)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Events load failed', e);
    }
}
