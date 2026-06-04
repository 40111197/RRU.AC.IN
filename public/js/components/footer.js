async function initFooter() {
    const footer = document.getElementById('footer');
    try {
        const settings = await window.api.get('/site_settings');
        const getVal = (key) => settings.find(s => s.key === key)?.value || '';

        footer.className = 'footer-section';
        // Note: Main background is handled by CSS class footer-section
        
        footer.innerHTML = `
            <div class="container" style="display:grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr; gap:40px; padding: 48px 0 0;">
                <div class="footer-about">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                        <img src="https://rru.ac.in/wp-content/uploads/2020/07/RRU-Logo.png" alt="Logo" style="height:40px; filter:brightness(0) invert(1)">
                        <div>
                            <h3 style="margin:0; font-size:16px; font-weight:700; color:white; line-height:1.2;">Rashtriya Raksha University</h3>
                            <p class="footer-tagline" style="margin:0; font-size:13px; color:#93c5fd; font-weight:500;">National Security is Supreme</p>
                        </div>
                    </div>
                    <div style="margin-top:20px">
                        <div class="footer-contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${getVal('address') || 'Lavad, Dehgam, Gandhinagar<br>Gujarat, India, 382305'}</span>
                        </div>
                        <div class="footer-contact-item">
                            <i class="fas fa-phone"></i>
                            <span>${getVal('phone') || '+91-079-68126800'}</span>
                        </div>
                        <div class="footer-contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>${getVal('footer_email_admin') || 'registrar@rru.ac.in (For Administration)'}</span>
                        </div>
                        <div class="footer-contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>${getVal('footer_email_admissions') || 'admission@rru.ac.in (For Admissions)'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Academics</a></li>
                        <li><a href="#">Admissions</a></li>
                        <li><a href="#">Faculty</a></li>
                        <li><a href="#">Research</a></li>
                    </ul>
                </div>
                
                <div class="footer-links">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="#">Alumni Portal</a></li>
                        <li><a href="#">Library</a></li>
                        <li><a href="#">News & Events</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Careers</a></li>
                    </ul>
                </div>
                
                <div class="footer-badges" style="text-align:right">
                    <div class="partner-badge">
                        <img src="https://rru.ac.in/wp-content/uploads/2021/10/Digital-India-Logo.png" alt="Digital India" style="height:44px;">
                    </div>
                    <br>
                    <div class="partner-badge">
                        <img src="https://rru.ac.in/wp-content/uploads/2021/10/MHA-Logo.png" alt="MHA" style="height:50px;">
                    </div>
                </div>
            </div>
            
            <div class="container">
                <hr class="footer-divider">
                <div class="footer-bottom">
                    <div class="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Use</a>
                        <a href="#">Disclaimer</a>
                        <a href="#">Accessibility</a>
                        <a href="#">Sitemap</a>
                        <a href="#">Help</a>
                    </div>
                    
                    <div class="footer-social">
                        <a href="#"><i class="fab fa-facebook-f"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-linkedin-in"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                    </div>
                    
                    <div class="footer-meta">
                        <span>Last Updated: 3 June 2026</span><br>
                        <span>Visitors: 1,00,000+</span>
                    </div>
                </div>
            </div>
            
            <div class="footer-copyright">
                <p>© 2026 © Rashtriya Raksha University. All rights reserved.</p>
                <p>Content owned & provided by Rashtriya Raksha University, India</p>
            </div>
        `;
    } catch (e) {
        console.error('Footer load failed', e);
    }
}
