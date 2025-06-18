/**
 * Content Loader - Loads saved content on page load
 * This runs for all visitors to apply saved editor changes
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        phpBaseUrl: window.location.pathname.includes('/en/') ? '../php/' : 'php/',
        loadDelay: 50 // Small delay to ensure DOM is ready
    };

    // Initialize
    function init() {
        // Determine current page URL for content management
        const pathname = window.location.pathname;
        const pageName = pathname.split('/').pop().replace('.html', '') || 'index';
        const isEnglish = pathname.includes('/en/');
        const currentPageUrl = isEnglish ? 'en_' + pageName : pageName;
        
        console.log('Content loader initialized for page:', currentPageUrl);
        
        // Load saved content after a short delay
        setTimeout(() => loadSavedContent(currentPageUrl), CONFIG.loadDelay);
    }

    // Load saved content from server
    async function loadSavedContent(pageUrl) {
        try {
            const response = await fetch(CONFIG.phpBaseUrl + 'load-content.php?page=' + pageUrl);
            const data = await response.json();
            
            if (data.success && data.content && Object.keys(data.content).length > 0) {
                console.log('Loading saved content for page:', pageUrl);
                applySavedContent(data.content);
            }
        } catch (error) {
            console.log('No saved content found or error loading:', error);
        }
    }

    // Apply saved content to page
    function applySavedContent(content) {
        Object.keys(content).forEach(elementId => {
            const element = document.querySelector(`[data-editor-id="${elementId}"]`);
            if (element) {
                if (element.tagName === 'IMG') {
                    element.src = content[elementId];
                } else {
                    element.innerHTML = content[elementId];
                }
            } else {
                // If element doesn't have data-editor-id, try to find it by recreating the ID
                // This handles cases where the editor hasn't been loaded yet
                const idParts = elementId.split('-');
                if (idParts.length >= 3) {
                    const elementType = idParts[0];
                    const pagePrefix = idParts.slice(1, -1).join('-');
                    const index = parseInt(idParts[idParts.length - 1]);
                    
                    if (elementType === 'text') {
                        const editableSelectors = 'h1, h2, h3, h4, h5, h6, p, li, span:not(.no-edit), a:not(.no-edit), td, th';
                        const elements = document.querySelectorAll(editableSelectors);
                        let validIndex = 0;
                        
                        elements.forEach((el) => {
                            // Skip elements in specific areas
                            if (el.closest('#editor-toolbar') || 
                                el.closest('#editor-login-panel') || 
                                el.closest('#editor-image-overlay') ||
                                el.closest('.language-selector') ||
                                el.closest('script') ||
                                el.closest('style')) {
                                return;
                            }
                            
                            if (validIndex === index) {
                                el.innerHTML = content[elementId];
                                el.setAttribute('data-editor-id', elementId);
                            }
                            validIndex++;
                        });
                    } else if (elementType === 'img') {
                        const images = document.querySelectorAll('img');
                        let validIndex = 0;
                        
                        images.forEach((img) => {
                            // Skip editor UI images
                            if (img.closest('#editor-toolbar') || 
                                img.closest('#editor-login-panel') ||
                                img.closest('.language-selector') ||
                                img.id === 'editor-upload-progress') {
                                return;
                            }
                            
                            if (validIndex === index) {
                                img.src = content[elementId];
                                img.setAttribute('data-editor-id', elementId);
                            }
                            validIndex++;
                        });
                    }
                }
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();