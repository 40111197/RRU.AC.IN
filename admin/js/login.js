document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorArea = document.getElementById('error-area');
    const lockoutTimer = document.getElementById('lockout-timer');
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('password');

    // Password Toggle
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordToggle.querySelector('i').classList.toggle('fa-eye');
        passwordToggle.querySelector('i').classList.toggle('fa-eye-slash');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorArea.style.display = 'none';
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // 1. Check Rate Limit (OWASP A04)
        const waitTime = window.security.checkRateLimit('login_attempts', 5, 900000); // 5 attempts per 15 mins
        if (waitTime > 0) {
            lockoutTimer.textContent = `Too many failed attempts. Try again in ${waitTime} seconds.`;
            lockoutTimer.style.display = 'block';
            return;
        }

        try {
            // 2. Hash Password (OWASP A02)
            const hashedPassword = CryptoJS.SHA256(password).toString();

            // 3. Authenticate against mock DB
            const users = await window.api.get(`/users?email=${email}&password=${hashedPassword}&is_active=true`);
            
            if (users && users.length > 0) {
                const user = users[0];
                
                // 4. Create Token
                const token = window.auth.createToken({ 
                    id: user.id, 
                    role: user.role, 
                    username: user.username 
                });

                // 5. Success Logging
                await window.api.post('/login_history', {
                    id: window.generateUUID(),
                    user_id: user.id,
                    email: email.replace(/(?<=.{2}).(?=.*@)/g, '*'), // Mask email (OWASP A02 variant)
                    status: 'success',
                    user_agent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                });

                // 6. Store Session
                sessionStorage.setItem('auth_token', token);
                sessionStorage.setItem('user', JSON.stringify({ 
                    username: user.username, 
                    role: user.role 
                }));

                // Reset login attempts
                sessionStorage.removeItem('login_attempts');
                
                window.location.href = 'dashboard.html';
            } else {
                // 7. Failure Logging
                await window.api.post('/login_history', {
                    id: window.generateUUID(),
                    email: email.replace(/(?<=.{2}).(?=.*@)/g, '*'),
                    status: 'failed',
                    user_agent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                });

                throw new Error('Invalid email or password');
            }
        } catch (error) {
            errorArea.textContent = error.message;
            errorArea.style.display = 'block';
        }
    });
});
