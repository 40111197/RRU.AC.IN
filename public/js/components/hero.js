async function initHero() {
    const heroSection = document.getElementById('hero');
    try {
        const slides = await window.api.get('/hero_slides?is_active=true');
        if (!slides || slides.length === 0) return;

        heroSection.innerHTML = slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" style="background-image: url('${slide.image_url}')">
                <div class="slide-top-banner">
                    <div class="container container-flex" style="height:100%;">
                        <div style="display:flex; align-items:center; gap:20px;">
                            <div style="width:50px; height:50px; border-radius:50%; background:white; padding:5px;">
                                <img src="https://rru.ac.in/wp-content/uploads/2020/07/RRU-Logo.png" alt="RRU Logo" style="width:100%; height:100%; object-fit:contain;">
                            </div>
                            <h1 style="color:white; font-weight:700; font-size:28px; letter-spacing:2px; margin:0; text-transform:uppercase;">RASHTRIYA RAKSHA UNIVERSITY PUDUCHERRY CAMPUS</h1>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px; color:white;">
                            <img src="https://rru.ac.in/wp-content/uploads/2021/10/MHA-Logo.png" alt="MHA" style="height:50px; filter:brightness(0) invert(1);">
                            <div style="font-size:12px; font-weight:600; text-align:right;">MINISTRY OF<br>HOME AFFAIRS</div>
                        </div>
                    </div>
                </div>
                
                <div class="slide-bottom-caption">
                    <p>${window.sanitizeHTML(slide.title)}: ${window.sanitizeHTML(slide.subtitle)}</p>
                </div>
            </div>
        `).join('') + `
            <div class="slider-nav">
                <button class="prev-slide"><i class="fas fa-chevron-left"></i></button>
                <button class="next-slide"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="slider-dots">
                ${slides.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
            </div>
        `;

        startSlider();
    } catch (e) {
        console.error('Hero load failed', e);
    }
}

function startSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let current = 0;

    if (slides.length === 0) return;

    function showSlide(index) {
        slides[current].classList.remove('active');
        if (dots.length > 0) dots[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        if (dots.length > 0) dots[current].classList.add('active');
    }

    // Auto advance
    let timer = setInterval(() => showSlide(current + 1), 5000);

    document.querySelector('.next-slide')?.addEventListener('click', () => {
        clearInterval(timer);
        showSlide(current + 1);
        timer = setInterval(() => showSlide(current + 1), 5000);
    });

    document.querySelector('.prev-slide')?.addEventListener('click', () => {
        clearInterval(timer);
        showSlide(current - 1);
        timer = setInterval(() => showSlide(current + 1), 5000);
    });
}
