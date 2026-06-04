async function initAbout() {
    const container = document.getElementById('about');
    try {
        const [data] = await window.api.get('/about_campus');
        if (!data) return;

        container.innerHTML = `
            <div class="container grid-2">
                <div class="about-text">
                    <h2 class="section-title">About the Campus</h2>
                    <div class="content">
                        ${window.sanitizeHTML(data.content)}
                    </div>
                    <button class="btn btn-primary" style="margin-top:20px" id="read-more-about">Read More &gt;</button>
                </div>
                <div class="about-image">
                    <img src="${data.image_url}" alt="Campus">
                </div>
            </div>
        `;
    } catch (e) {
        console.error('About load failed', e);
    }
}
