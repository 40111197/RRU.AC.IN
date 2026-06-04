async function initGallery() {
    const container = document.getElementById('gallery-grid');
    try {
        const items = await window.api.get('/gallery?is_active=true&_limit=6');
        
        container.innerHTML = items.map(item => `
            <div class="gallery-item">
                <img src="${item.image_url}" alt="${item.caption}">
                <div class="gallery-caption">
                    <p>${window.sanitizeHTML(item.caption)}</p>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Gallery load failed', e);
    }
}
