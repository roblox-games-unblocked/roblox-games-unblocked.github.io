// assets/js/ad_manager.js

async function loadAndApplyAdConfig() {
    const configUrl = '/assets/config/ad_config.json?v=' + new Date().getTime(); // Cache buster
    let adConfig = {};

    try {
        const response = await fetch(configUrl);
        if (!response.ok) {
            console.error('Failed to load ad_config.json, status:', response.status);
            // Fallback: Attempt to hide all known ad slots if config load fails
            document.querySelectorAll('.ad-slot-placeholder').forEach(el => {
                if (el.id !== 'interstitial-ad-unit') { // Don't hide the interstitial unit itself, just its parent overlay if needed
                    el.style.display = 'none';
                }
            });
            const interstitialOverlay = document.getElementById('interstitial-ad-overlay');
            if(interstitialOverlay) interstitialOverlay.style.display = 'none';

            return; 
        }
        adConfig = await response.json();
        console.log('Ad config loaded:', adConfig);
    } catch (error) {
        console.error('Error fetching or parsing ad_config.json:', error);
        // Fallback on error
        document.querySelectorAll('.ad-slot-placeholder').forEach(el => {
            if (el.id !== 'interstitial-ad-unit') {
                 el.style.display = 'none';
            }
        });
        const interstitialOverlay = document.getElementById('interstitial-ad-overlay');
        if(interstitialOverlay) interstitialOverlay.style.display = 'none';
        return; 
    }

    function displayAd(selector, adData, isInterstitialUnit = false) {
        const el = document.querySelector(selector);
        if (!el) {
            // console.warn('Ad slot not found for selector:', selector);
            return;
        }

        if (adConfig.ads_enabled_global && adData && adData.enabled) {
            el.innerHTML = adData.ad_code; 
            
            // Only change display style if it's not the interstitial ad unit itself,
            // as its visibility is controlled by the interstitial overlay logic.
            if (!isInterstitialUnit) {
                el.style.display = 'flex'; // Or 'block' or your default for visible ad slots
            }
            console.log('Ad enabled and content set for:', selector);

            const scripts = el.querySelectorAll("script");
            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                if (oldScript.innerHTML) {
                    newScript.text = oldScript.innerHTML; // Use .text for inline scripts
                }
                // It's important to append to a document-attached parent for the script to execute.
                // Replacing child might not always trigger execution as reliably.
                // We assume 'el' is already in the document.
                if (oldScript.parentNode) {
                     oldScript.parentNode.replaceChild(newScript, oldScript);
                } else {
                    // This case should ideally not happen if 'el' is in the document.
                    document.head.appendChild(newScript); // Fallback, not ideal for ad scripts usually.
                }
                console.log('Script re-executed for ad slot:', selector);
            });

        } else {
            if (!isInterstitialUnit) {
                el.style.display = 'none'; 
            } else if (el.id === 'interstitial-ad-unit' && interstitialOverlay) {
                // If interstitial ad is disabled, hide the whole overlay
                const interstitialOverlay = document.getElementById('interstitial-ad-overlay');
                if(interstitialOverlay) {
                    interstitialOverlay.style.display = 'none';
                    interstitialOverlay.classList.add('ad-config-hidden'); // Mark it as hidden by config
                }
            }
            console.log('Ad disabled or no data for:', selector);
        }
    }

    // Determine current page type (could also be passed from Jinja if needed)
    const bodyClass = document.body.className;

    if (bodyClass.includes('page-home') && adConfig.homepage) {
        displayAd('#ad-home-sidebar-left', adConfig.homepage.sidebar_left);
        displayAd('#ad-home-sidebar-right', adConfig.homepage.sidebar_right);
    }

    if (bodyClass.includes('page-category') && adConfig.category_page) {
        displayAd('#ad-category-sidebar-left', adConfig.category_page.sidebar_left);
        displayAd('#ad-category-sidebar-right', adConfig.category_page.sidebar_right);
    }
    
    if (bodyClass.includes('page-game') && adConfig.game_page) {
        // For interstitial, we only care about setting its content.
        // The interstitial's visibility is controlled by `showInterstitialOnGamePage`.
        displayAd('#interstitial-ad-unit', adConfig.game_page.interstitial, true); 

        displayAd('#ad-game-top-banner', adConfig.game_page.top_banner);
        displayAd('#ad-game-sidebar-left', adConfig.game_page.sidebar_left);
        displayAd('#ad-game-sidebar-right', adConfig.game_page.sidebar_right);
    }
}

// Call this function when the DOM is ready
window.addEventListener('DOMContentLoaded', loadAndApplyAdConfig);