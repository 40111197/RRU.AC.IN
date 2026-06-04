// main.js - Orchestrates the public-facing website

document.addEventListener('DOMContentLoaded', async () => {
    console.log('RRU Puducherry Website Initializing...');

    // Initialize all components
    initHero();
    initAbout();
    initVC();
    initDirector();
    initNews();
    initEvents();
    initGallery();
    initContact();
    initFooter();

    // Check if admin is logged in (to show edit button)
    const user = window.auth.getLoggedInUser();
    if (user) {
        document.getElementById('admin-edit-btn').style.display = 'block';
    }
});
