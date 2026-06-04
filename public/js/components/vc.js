async function initVC() {
    const container = document.getElementById('vc-message');
    try {
        const [data] = await window.api.get('/vice_chancellor');
        if (!data) return;

        container.innerHTML = `
            <div class="container vc-card">
                <div class="vc-image-frame">
                    <img src="${data.image_url}" alt="${data.name}">
                </div>
                <div class="vc-info">
                    <h4>Message from the Vice-Chancellor</h4>
                    <h2>${window.sanitizeHTML(data.name)}</h2>
                    <p class="designation">${window.sanitizeHTML(data.designation)}</p>
                    <p class="message">"${window.sanitizeHTML(data.message.substring(0, 300))}..."</p>
                    <a href="#" class="btn btn-outline" style="color:var(--orange); border:1px solid var(--orange); padding:8px 15px">Read Full Message ></a>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('VC load failed', e);
    }
}
