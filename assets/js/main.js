// assets/js/main.js

(function() {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
    });

    // Mobile Dropdown Toggle Logic
    document.querySelectorAll('.main-nav .dropdown > a').forEach(function(toggleLink) {
        toggleLink.addEventListener('click', function(event) {
            // Only apply this logic in mobile view (when the toggle button is visible)
            if (window.getComputedStyle(menuToggle).display !== 'none') {
                event.preventDefault(); // Prevent the link from being followed on mobile
                
                let submenu = this.nextElementSibling; // The .dropdown-content div

                if (submenu.classList.contains('submenu-active')) {
                    // If it's already open, close it
                    submenu.classList.remove('submenu-active');
                } else {
                    // If it's closed, first close any other open submenus in the nav
                    mainNav.querySelectorAll('.submenu-active').forEach(function(openSubmenu) {
                        openSubmenu.classList.remove('submenu-active');
                    });
                    // Then, open the one that was clicked
                    submenu.classList.add('submenu-active');
                }
            }
        });
    });
})();