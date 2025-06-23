document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content-container');
    const mainNav = document.getElementById('main-nav');
    const menuToggle = document.getElementById('menu-toggle');

    // --- Mobile Menu Toggle ---
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // --- Core Content Loading Function ---
    const loadContent = async (url) => {
        contentContainer.innerHTML = '<div class="loading">Loading...</div>';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Page not found: ${response.status}`);
            
            const contentHTML = await response.text();
            contentContainer.innerHTML = contentHTML;

            const contentRoot = contentContainer.querySelector('[data-title]');
            document.title = contentRoot ? contentRoot.dataset.title : 'Game Portal';

            const newScript = contentContainer.querySelector('script');
            if (newScript) {
                const script = document.createElement('script');
                script.innerHTML = newScript.innerHTML;
                document.body.appendChild(script).remove();
            }
            updateActiveLink(url);
        } catch (error) {
            console.error('Error loading content:', error);
            contentContainer.innerHTML = `<div class="error">Sorry, we couldn't load this page. Please try again.</div>`;
        }
    };
    
    // --- Intercept Link Clicks ---
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link && link.hostname === window.location.hostname) {
            event.preventDefault();
            const path = link.getAttribute('href');
            if (window.location.pathname !== path) {
                history.pushState({ path }, '', path);
                loadContent(path);
            }
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        }
    });

    // --- Handle Browser Back/Forward Buttons ---
    window.addEventListener('popstate', (event) => {
        const path = event.state ? event.state.path : (window.location.pathname === '/' ? 'home.html' : window.location.pathname);
        loadContent(path);
    });
    
    // --- Highlight the Active Menu Link ---
    const updateActiveLink = (path) => {
        document.querySelectorAll('.main-nav a').forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === path) {
                a.classList.add('active');
            }
        });
    };

    // --- Initial Page Load ---
    const initialPath = window.location.pathname === '/' ? 'home.html' : window.location.pathname;
    history.replaceState({ path: initialPath }, '', initialPath);
    loadContent(initialPath);
});