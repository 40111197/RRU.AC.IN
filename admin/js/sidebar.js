// sidebar.js - Shared sidebar component logic (emoji icons, blue theme)

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('editor')) return;

    const user = window.auth.getLoggedInUser
        ? window.auth.getLoggedInUser()
        : JSON.parse(sessionStorage.getItem('user') || '{}');

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const navItems = [
        { icon: '🏠', label: 'Dashboard',       href: 'dashboard.html',     role: 'editor' },
        { icon: '🎞️', label: 'Hero Slides',      href: 'hero.html',          role: 'editor' },
        { icon: 'ℹ️',  label: 'About',            href: 'about.html',         role: 'editor' },
        { icon: '🎓', label: 'Vice Chancellor',  href: 'vc.html',            role: 'editor' },
        { icon: '👔', label: 'Director',         href: 'director.html',      role: 'editor' },
        { icon: '📰', label: 'News',             href: 'news.html',          role: 'editor' },
        { icon: '📅', label: 'Events',           href: 'events.html',        role: 'editor' },
        { icon: '🖼️', label: 'Gallery',          href: 'gallery.html',       role: 'editor' },
        { icon: '📞', label: 'Contact',          href: 'contact.html',       role: 'editor' },
        { icon: '⚙️', label: 'Settings',         href: 'settings.html',      role: 'superadmin' },
        { icon: '📋', label: 'Audit Logs',       href: 'audit-logs.html',    role: 'superadmin' },
        { icon: '🔐', label: 'Login History',    href: 'login-history.html', role: 'superadmin' },
        { icon: '👥', label: 'Users',            href: 'users.html',         role: 'superadmin' }
    ];

    const roleLevel = { editor: 1, admin: 2, superadmin: 3 };
    const currentRoleLevel = roleLevel[user.role] || 0;

    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

    // Build nav items HTML
    const buildNavItems = () => {
        let html = `<div class="nav-section-label">MAIN MENU</div>`;
        navItems.forEach(item => {
            const requiredLevel = roleLevel[item.role] || 1;
            if (currentRoleLevel < requiredLevel) return;
            const isActive = currentPage === item.href ? 'active' : '';
            html += `
                <a href="${item.href}" class="nav-item ${isActive}">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                </a>`;
        });
        return html;
    };

    sidebar.innerHTML = `
        <div class="sidebar-brand">
            <div style="display:flex;align-items:center;gap:12px">
                <div class="sidebar-logo-circle">RRU</div>
                <div>
                    <div class="sidebar-title">RRU Admin</div>
                    <div class="sidebar-subtitle">Puducherry Campus</div>
                </div>
            </div>
        </div>

        <div class="sidebar-user">
            <div style="display:flex;align-items:center;gap:10px">
                <div class="avatar">${(user.username || 'A').charAt(0).toUpperCase()}</div>
                <div>
                    <div class="user-name">${user.username || 'Admin'}</div>
                    <span class="role-badge ${user.role}">${user.role}</span>
                </div>
            </div>
        </div>

        <nav class="nav-menu">
            ${buildNavItems()}
        </nav>

        <div style="margin-top:auto; padding:16px; padding-top:0">
            <button id="logout-btn" class="sidebar-logout">
                🚪 Logout
            </button>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
        window.auth.logout();
    });
});
