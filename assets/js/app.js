document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content-container');
    const mainNav = document.getElementById('main-nav');
    const menuToggle = document.getElementById('menu-toggle');

    // --- Mobile Menu Toggle ---
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // --- Core Content Loading Function (Unchanged) ---
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

    // --- Intercept Link Clicks (UPDATED LOGIC) ---
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link && link.hostname === window.location.hostname) {
            event.preventDefault();

            // The URL to show in the browser bar comes from href
            const displayPath = link.getAttribute('href');
            // The file to fetch comes from data-content-src, or falls back to href
            const contentPath = link.dataset.contentSrc || displayPath;

            if (window.location.pathname !== displayPath) {
                // Push the CONTENT path to state, but the DISPLAY path to the URL bar
                history.pushState({ path: contentPath }, '', displayPath);
                loadContent(contentPath);
            }

            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        }
    });

    // --- Handle Browser Back/Forward Buttons (UPDATED LOGIC) ---
    window.addEventListener('popstate', (event) => {
        // When user navigates, the state object gives us the path to the content file
        if (event.state && event.state.path) {
            loadContent(event.state.path);
        } else {
            // Fallback for initial page or cases without state
            const initialPath = window.location.pathname === '/' ? 'home.html' : window.location.pathname;
            loadContent(initialPath);
        }
    });

    // --- Highlight Active Menu Link (UPDATED LOGIC) ---
    const updateActiveLink = (contentPath) => {
        document.querySelectorAll('.main-nav a').forEach(a => {
            const linkContentPath = a.dataset.contentSrc || a.getAttribute('href');
            if (linkContentPath === contentPath) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });
    };

    // --- Initial Page Load (UPDATED LOGIC) ---
    const initialDisplayPath = window.location.pathname;
    const initialContentPath = initialDisplayPath === '/' ? 'home.html' : initialDisplayPath;

    // Set the initial history state. Store the path to the CONTENT file,
    // but display the clean URL in the browser bar.
    history.replaceState({ path: initialContentPath }, '', initialDisplayPath);
    loadContent(initialContentPath);
});