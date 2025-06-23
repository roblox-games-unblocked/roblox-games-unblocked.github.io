document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content-container');
    const mainNav = document.getElementById('main-nav');
    const menuToggle = document.getElementById('menu-toggle');

    // --- Mobile Menu Toggle ---
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // --- NEW: Function to update <head> tags ---
    const updateMeta = (newContent) => {
        // Clear old dynamic tags
        document.querySelectorAll('[data-seo-dynamic]').forEach(tag => tag.remove());

        const template = newContent.querySelector('template#page-metadata');
        if (!template) return;

        const newHeadContent = template.content;

        // Update title
        const newTitle = newHeadContent.querySelector('title');
        if (newTitle) {
            document.title = newTitle.textContent;
        }

        // Add new meta and link tags
        const tags = newHeadContent.querySelectorAll('meta, link');
        tags.forEach(tag => {
            const newTag = tag.cloneNode(true);
            newTag.setAttribute('data-seo-dynamic', ''); // Mark as dynamic
            document.head.appendChild(newTag);
        });
    };

    // --- UPDATED: Core Content Loading Function ---
    const loadContent = async (url) => {
        contentContainer.innerHTML = '<div class="loading">Loading...</div>';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Page not found: ${response.status}`);
            const contentHTML = await response.text();
            contentContainer.innerHTML = contentHTML;

            // NEW: Call the function to update the head
            updateMeta(contentContainer);

            // Execute the script from the loaded content
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

    // --- Intercept Link Clicks (Unchanged Logic from your provided file) ---
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link && link.hostname === window.location.hostname) {
            event.preventDefault();
            const displayPath = link.getAttribute('href');
            const contentPath = link.dataset.contentSrc || displayPath;
            if (window.location.pathname !== displayPath) {
                history.pushState({ path: contentPath }, '', displayPath);
                loadContent(contentPath);
            }
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        }
    });

    // --- Handle Browser Back/Forward Buttons (Unchanged Logic) ---
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.path) {
            loadContent(event.state.path);
        } else {
            const initialPath = window.location.pathname === '/' ? 'home.html' : window.location.pathname;
            loadContent(initialPath);
        }
    });

    // --- Highlight Active Menu Link (Unchanged Logic) ---
    const updateActiveLink = (contentPath) => {
        document.querySelectorAll('.main-nav a').forEach(a => {
            const linkContentPath = a.dataset.contentSrc || a.getAttribute('href');
            a.classList.toggle('active', linkContentPath === contentPath);
        });
    };

    // --- Initial Page Load (Unchanged Logic) ---
    const initialDisplayPath = window.location.pathname;
    const initialContentPath = initialDisplayPath === '/' ? 'home.html' : initialDisplayPath;
    history.replaceState({ path: initialContentPath }, '', initialDisplayPath);
    loadContent(initialContentPath);
});