// sidebar.js - Shared sidebar component logic (emoji icons, blue theme)

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.checkAccess('editor')) return;

    const user = window.auth.getLoggedInUser
        ? window.auth.getLoggedInUser()
        : JSON.parse(sessionStorage.getItem('user') || '{}');

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const navItems = [
        { key: 'dashboard', label: 'Dashboard',       href: 'dashboard.html',     role: 'editor' },
        { key: 'hero',      label: 'Hero Slides',      href: 'hero.html',          role: 'editor' },
        { key: 'about',     label: 'About',            href: 'about.html',         role: 'editor' },
        { key: 'vc',        label: 'Vice Chancellor',  href: 'vc.html',            role: 'editor' },
        { key: 'director',  label: 'Director',         href: 'director.html',      role: 'editor' },
        { key: 'news',      label: 'News',             href: 'news.html',          role: 'editor' },
        { key: 'events',    label: 'Events',           href: 'events.html',        role: 'editor' },
        { key: 'gallery',   label: 'Gallery',          href: 'gallery.html',       role: 'editor' },
        { key: 'contact',   label: 'Contact',          href: 'contact.html',       role: 'editor' },
        { key: 'settings',  label: 'Settings',         href: 'settings.html',      role: 'superadmin' },
        { key: 'audit',     label: 'Audit Logs',       href: 'audit-logs.html',    role: 'superadmin' },
        { key: 'login_history', label: 'Login History',    href: 'login-history.html', role: 'superadmin' },
        { key: 'users',     label: 'Users',            href: 'users.html',         role: 'superadmin' }
    ];

    const NAV_SVG_ICONS = {
        dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
        hero: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
        about: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        vc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        director: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        news: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2z"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>`,
        events: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        gallery: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
        contact: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.55 5.55l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>`,
        settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        audit: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
        login_history: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
        users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`
    };

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
                    <span class="nav-icon">${NAV_SVG_ICONS[item.key]}</span>
                    <span class="nav-label">${item.label}</span>
                </a>`;
        });
        return html;
    };

    sidebar.innerHTML = `
        <div class="sidebar-brand">
            <div style="display:flex;align-items:center;gap:12px">
                <div class="sidebar-logo-circle">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                <div>
                    <div class="sidebar-title">RRU Admin</div>
                    <div class="sidebar-subtitle">Puducherry Campus</div>
                </div>
            </div>
        </div>

        <div class="sidebar-user">
            <div style="display:flex;align-items:center;gap:10px">
                <div class="user-avatar">${(user.username || 'A').charAt(0).toUpperCase()}</div>
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
                ${NAV_SVG_ICONS.logout}
                Logout
            </button>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
        window.auth.logout();
    });
});
