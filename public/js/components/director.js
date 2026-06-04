async function initDirector() {
    const container = document.getElementById('director-message');
    try {
        const [data] = await window.api.get('/campus_director');
        if (!data) return;

        container.innerHTML = `
            <div class="director-card">
                <div class="director-card-header">
                    <div class="header-icon"><i class="fas fa-user-tie"></i></div>
                    <h3>Campus Director, Puducherry Campus</h3>
                </div>
                <div class="director-card-body">
                    <img src="${data.image_url}" alt="${data.name}" class="dir-img">
                    <div class="dir-content">
                        <h2>${window.sanitizeHTML(data.name)}</h2>
                        <p class="dir-designation">${window.sanitizeHTML(data.designation || 'Campus Director')}</p>
                        <p>${window.sanitizeHTML(data.message)}</p>
                        <div class="dir-contact-box">
                            <div class="contact-label">Contact Information</div>
                            <div class="contact-row">
                                <i class="fas fa-envelope"></i>
                                <span>${window.sanitizeHTML(data.contact_email)}</span>
                            </div>
                        </div>
                        <button class="dir-profile-btn">View Full Profile &gt;</button>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Director load failed', e);
    }
}
