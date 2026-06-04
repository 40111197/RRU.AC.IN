async function initContact() {
    const container = document.getElementById('contact');
    try {
        const [data] = await window.api.get('/contact_details');
        if (!data) return;

        container.innerHTML = `
            <div class="container">
                <h2 class="section-title">Get in Touch</h2>
                <div class="contact-cards-wrapper">
                    <div class="contact-card">
                        <div class="contact-icon-circle">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <h4>Email</h4>
                        <p>${window.sanitizeHTML(data.email)}</p>
                    </div>
                    <div class="contact-card">
                        <div class="contact-icon-circle">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <h4>Location</h4>
                        <p>${window.sanitizeHTML(data.location)}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Contact load failed', e);
    }
}
