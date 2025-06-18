/**
 * Villarromana Admin Editor System
 * Fully functional editor that integrates with PHP backend
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        username: 'admin',
        password: 'metadrop2024',
        phpBaseUrl: window.location.pathname.includes('/en/') ? '../php/' : 'php/',
        sessionKey: 'villarromana_admin_session',
        contentLoadDelay: 100 // Small delay to ensure DOM is ready
    };

    // State management
    let isLoggedIn = false;
    let isEditMode = false;
    let editedContent = {};
    let originalContent = {};
    let currentPageUrl = '';
    let imageUploadQueue = [];
    let captchaAnswer = 0;

    // Initialize
    function init() {
        // Determine current page URL for content management
        const pathname = window.location.pathname;
        const pageName = pathname.split('/').pop().replace('.html', '') || 'index';
        const isEnglish = pathname.includes('/en/');
        currentPageUrl = isEnglish ? 'en_' + pageName : pageName;
        
        console.log('Editor initialized for page:', currentPageUrl);
        
        // Check existing session
        if (sessionStorage.getItem(CONFIG.sessionKey) === 'active') {
            isLoggedIn = true;
        }
        
        createUI();
        setupEventListeners();
        
        // Load saved content after a short delay
        setTimeout(loadSavedContent, CONFIG.contentLoadDelay);
    }

    // Create UI elements
    function createUI() {
        // Check if UI already exists
        if (document.getElementById('editor-admin-btn')) return;

        // Admin button - small lock icon only
        const adminBtn = document.createElement('button');
        adminBtn.id = 'editor-admin-btn';
        adminBtn.innerHTML = '🔐';
        adminBtn.title = 'Admin Login';
        adminBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            padding: 0;
            background: #2c5530;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10000;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: all 0.3s ease, top 0.3s ease, right 0.3s ease, width 0.3s ease, height 0.3s ease;
        `;
        
        // Set initial position based on screen size
        document.body.appendChild(adminBtn);
        adjustAdminButtonPosition();
        adminBtn.onmouseover = () => {
            adminBtn.style.transform = 'scale(1.1)';
            adminBtn.style.background = '#4a904d';
        };
        adminBtn.onmouseout = () => {
            adminBtn.style.transform = 'scale(1)';
            adminBtn.style.background = '#2c5530';
        };

        // Login panel
        const loginPanel = document.createElement('div');
        loginPanel.id = 'editor-login-panel';
        loginPanel.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 20000;
            justify-content: center;
            align-items: center;
        `;
        loginPanel.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%; box-shadow: 0 5px 20px rgba(0,0,0,0.3);">
                <h3 style="margin: 0 0 20px 0; color: #2c5530; font-family: 'Playfair Display', serif;">Admin Login</h3>
                <form id="editor-login-form">
                    <input type="text" id="editor-username" placeholder="Username" required 
                           style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 16px;">
                    <input type="password" id="editor-password" placeholder="Password" required 
                           style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 16px;">
                    
                    <!-- Simple Math Captcha -->
                    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; border: 1px solid #e9ecef;">
                        <label style="display: block; margin-bottom: 8px; color: #495057; font-size: 14px;">Security Check:</label>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span id="editor-captcha-question" style="font-size: 16px; font-weight: bold; color: #2c5530;"></span>
                            <input type="number" id="editor-captcha-answer" placeholder="?" required 
                                   style="width: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; text-align: center;">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="flex: 1; padding: 12px; background: #2c5530; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background 0.3s;">Login</button>
                        <button type="button" id="editor-cancel-login" style="flex: 1; padding: 12px; background: #ccc; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background 0.3s;">Cancel</button>
                    </div>
                </form>
                <div id="editor-error" style="color: #d9534f; margin-top: 15px; display: none; text-align: center;"></div>
            </div>
        `;
        document.body.appendChild(loginPanel);

        // Editor toolbar
        const toolbar = document.createElement('div');
        toolbar.id = 'editor-toolbar';
        toolbar.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #2c5530;
            color: white;
            padding: 15px;
            z-index: 11000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        toolbar.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 18px; font-weight: bold;">🛠️ Edit Mode - ${currentPageUrl}</span>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span id="editor-status" style="font-size: 14px; opacity: 0.8;"></span>
                    <button id="editor-save" style="padding: 8px 16px; background: #4a904d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s;">💾 Save Changes</button>
                    <button id="editor-discard" style="padding: 8px 16px; background: #f0ad4e; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s;">↩️ Discard</button>
                    <button id="editor-logout" style="padding: 8px 16px; background: #d9534f; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s;">🚪 Logout</button>
                </div>
            </div>
        `;
        document.body.appendChild(toolbar);

        // Image upload overlay
        const imageOverlay = document.createElement('div');
        imageOverlay.id = 'editor-image-overlay';
        imageOverlay.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 30000;
            text-align: center;
        `;
        imageOverlay.innerHTML = `
            <div style="font-size: 16px; margin-bottom: 10px;">Uploading image...</div>
            <div style="width: 200px; height: 4px; background: #eee; border-radius: 2px; overflow: hidden;">
                <div id="editor-upload-progress" style="width: 0%; height: 100%; background: #4a904d; transition: width 0.3s;"></div>
            </div>
        `;
        document.body.appendChild(imageOverlay);

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            body.editor-active {
                padding-top: 60px;
            }
            
            .editor-active [data-editable="true"] {
                outline: 2px dashed #4a904d;
                outline-offset: 3px;
                cursor: text;
                min-height: 20px;
                position: relative;
            }
            
            .editor-active [data-editable="true"]:hover {
                outline-color: #2c5530;
                background-color: rgba(74, 144, 77, 0.05);
            }
            
            .editor-active [data-editable="true"]:focus {
                outline: 3px solid #2c5530;
                outline-offset: 3px;
            }
            
            .editor-active img[data-editable-image="true"] {
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }
            
            .editor-active img[data-editable-image="true"]:hover {
                opacity: 0.8;
                outline: 3px dashed #4a904d;
                outline-offset: 5px;
                transform: scale(0.98);
            }
            
            .editor-image-label {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(44, 85, 48, 0.9);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .editor-active img[data-editable-image="true"]:hover + .editor-image-label,
            .editor-active .editor-image-container:hover .editor-image-label {
                opacity: 1;
            }
            
            @media (max-width: 768px) {
                #editor-toolbar > div {
                    flex-direction: column;
                    gap: 10px;
                }
                
                #editor-toolbar span:first-child {
                    font-size: 16px;
                }
                
                #editor-status {
                    display: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Admin button
        document.getElementById('editor-admin-btn').addEventListener('click', () => {
            if (isLoggedIn) {
                if (!isEditMode) {
                    enableEditMode();
                }
            } else {
                // Generate new captcha when showing login
                generateCaptcha();
                document.getElementById('editor-login-panel').style.display = 'flex';
                document.getElementById('editor-username').focus();
            }
        });

        // Login form
        document.getElementById('editor-login-form').addEventListener('submit', handleLogin);
        
        // Cancel login
        document.getElementById('editor-cancel-login').addEventListener('click', () => {
            document.getElementById('editor-login-panel').style.display = 'none';
            document.getElementById('editor-login-form').reset();
            document.getElementById('editor-error').style.display = 'none';
            captchaAnswer = 0; // Reset captcha
        });

        // Toolbar buttons
        document.getElementById('editor-save').addEventListener('click', saveChanges);
        document.getElementById('editor-discard').addEventListener('click', discardChanges);
        document.getElementById('editor-logout').addEventListener('click', logout);

        // Close login panel on outside click
        document.getElementById('editor-login-panel').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.style.display = 'none';
                document.getElementById('editor-login-form').reset();
                document.getElementById('editor-error').style.display = 'none';
                captchaAnswer = 0; // Reset captcha
            }
        });

        // Prevent form submission on contenteditable enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.getAttribute('contenteditable') === 'true') {
                if (!e.shiftKey && e.target.tagName !== 'P' && e.target.tagName !== 'LI') {
                    e.preventDefault();
                }
            }
        });
        
        // Handle window resize to adjust admin button position
        window.addEventListener('resize', adjustAdminButtonPosition);
    }
    
    // Adjust admin button position based on screen size
    function adjustAdminButtonPosition() {
        const adminBtn = document.getElementById('editor-admin-btn');
        if (adminBtn) {
            if (window.innerWidth <= 768) {
                // On mobile, position below header to avoid menu toggle
                adminBtn.style.top = '90px';
                adminBtn.style.right = '20px';
                adminBtn.style.width = '45px';
                adminBtn.style.height = '45px';
                adminBtn.style.fontSize = '20px';
            } else if (window.innerWidth <= 1024) {
                // On tablets, slightly adjust position
                adminBtn.style.top = '25px';
                adminBtn.style.right = '70px';
                adminBtn.style.width = '40px';
                adminBtn.style.height = '40px';
                adminBtn.style.fontSize = '18px';
            } else {
                // Default desktop position
                adminBtn.style.top = '20px';
                adminBtn.style.right = '20px';
                adminBtn.style.width = '40px';
                adminBtn.style.height = '40px';
                adminBtn.style.fontSize = '18px';
            }
        }
    }

    // Generate simple math captcha
    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = num1 + num2;
        
        const captchaQuestion = document.getElementById('editor-captcha-question');
        if (captchaQuestion) {
            captchaQuestion.textContent = `${num1} + ${num2} = `;
        }
        
        // Clear previous answer
        const captchaInput = document.getElementById('editor-captcha-answer');
        if (captchaInput) {
            captchaInput.value = '';
        }
    }

    // Handle login
    async function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('editor-username').value;
        const password = document.getElementById('editor-password').value;
        const userCaptchaAnswer = parseInt(document.getElementById('editor-captcha-answer').value);
        const errorDiv = document.getElementById('editor-error');
        
        // Validate captcha first
        if (userCaptchaAnswer !== captchaAnswer) {
            errorDiv.textContent = 'Incorrect security answer. Please try again.';
            errorDiv.style.display = 'block';
            generateCaptcha(); // Generate new captcha
            document.getElementById('editor-captcha-answer').value = '';
            document.getElementById('editor-captcha-answer').focus();
            // Shake effect
            errorDiv.style.animation = 'shake 0.5s';
            setTimeout(() => errorDiv.style.animation = '', 500);
            return;
        }
        
        // Validate credentials
        if (username === CONFIG.username && password === CONFIG.password) {
            isLoggedIn = true;
            sessionStorage.setItem(CONFIG.sessionKey, 'active');
            document.getElementById('editor-login-panel').style.display = 'none';
            document.getElementById('editor-login-form').reset();
            errorDiv.style.display = 'none';
            enableEditMode();
        } else {
            errorDiv.textContent = 'Invalid credentials';
            errorDiv.style.display = 'block';
            generateCaptcha(); // Generate new captcha on failed login
            // Shake effect
            errorDiv.style.animation = 'shake 0.5s';
            setTimeout(() => errorDiv.style.animation = '', 500);
        }
    }

    // Load saved content from server
    async function loadSavedContent() {
        if (!currentPageUrl) return;
        
        try {
            const response = await fetch(CONFIG.phpBaseUrl + 'load-content.php?page=' + currentPageUrl);
            const data = await response.json();
            
            if (data.success && data.content && Object.keys(data.content).length > 0) {
                console.log('Loading saved content for page:', currentPageUrl);
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
            }
        });
    }

    // Enable edit mode
    function enableEditMode() {
        isEditMode = true;
        document.body.classList.add('editor-active');
        document.getElementById('editor-toolbar').style.display = 'block';
        document.getElementById('editor-admin-btn').style.display = 'none';
        
        updateStatus('Edit mode enabled');
        
        // Make text elements editable
        const editableSelectors = 'h1, h2, h3, h4, h5, h6, p, li, span:not(.no-edit), a:not(.no-edit), td, th';
        document.querySelectorAll(editableSelectors).forEach((el, index) => {
            // Skip elements in editor UI
            if (el.closest('#editor-toolbar') || 
                el.closest('#editor-login-panel') || 
                el.closest('#editor-image-overlay') ||
                el.closest('.language-selector') ||
                el.closest('script') ||
                el.closest('style')) {
                return;
            }
            
            // Set unique ID and make editable
            const elementId = `text-${currentPageUrl}-${index}`;
            el.setAttribute('data-editor-id', elementId);
            el.setAttribute('data-editable', 'true');
            el.contentEditable = 'true';
            
            // Store original content
            originalContent[elementId] = el.innerHTML;
            
            // Track changes
            el.addEventListener('input', function() {
                editedContent[elementId] = this.innerHTML;
                updateStatus('Changes pending...');
            });
            
            // Prevent navigation on link edit
            if (el.tagName === 'A') {
                el.addEventListener('click', (e) => {
                    if (isEditMode) {
                        e.preventDefault();
                    }
                });
            }
        });
        
        // Make images replaceable
        document.querySelectorAll('img').forEach((img, index) => {
            // Skip editor UI images
            if (img.closest('#editor-toolbar') || 
                img.closest('#editor-login-panel') ||
                img.closest('.language-selector') ||
                img.id === 'editor-upload-progress') {
                return;
            }
            
            const elementId = `img-${currentPageUrl}-${index}`;
            img.setAttribute('data-editor-id', elementId);
            img.setAttribute('data-editable-image', 'true');
            
            // Store original source
            originalContent[elementId] = img.src;
            
            // Create container for label
            if (!img.parentElement.classList.contains('editor-image-container')) {
                const container = document.createElement('div');
                container.className = 'editor-image-container';
                container.style.position = 'relative';
                container.style.display = 'inline-block';
                img.parentNode.insertBefore(container, img);
                container.appendChild(img);
                
                const label = document.createElement('div');
                label.className = 'editor-image-label';
                label.textContent = 'Click to replace';
                container.appendChild(label);
            }
            
            img.addEventListener('click', handleImageClick);
        });
    }

    // Handle image click for replacement
    function handleImageClick(e) {
        if (!isEditMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const img = e.target;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                // Check file size
                if (file.size > 10 * 1024 * 1024) {
                    alert('Image size must be less than 10MB');
                    return;
                }
                
                // Show upload overlay
                document.getElementById('editor-image-overlay').style.display = 'block';
                document.getElementById('editor-upload-progress').style.width = '0%';
                
                try {
                    // Create form data
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('auth', CONFIG.password);
                    formData.append('elementId', img.dataset.editorId);
                    
                    // Upload image
                    const xhr = new XMLHttpRequest();
                    
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            document.getElementById('editor-upload-progress').style.width = percentComplete + '%';
                        }
                    };
                    
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            const response = JSON.parse(xhr.responseText);
                            if (response.success) {
                                // Update image source
                                img.src = response.url + '?t=' + Date.now();
                                editedContent[img.dataset.editorId] = response.url;
                                updateStatus('Image uploaded successfully');
                            } else {
                                alert('Error uploading image: ' + (response.error || 'Unknown error'));
                            }
                        } else {
                            alert('Error uploading image');
                        }
                        document.getElementById('editor-image-overlay').style.display = 'none';
                    };
                    
                    xhr.onerror = function() {
                        alert('Error uploading image');
                        document.getElementById('editor-image-overlay').style.display = 'none';
                    };
                    
                    xhr.open('POST', CONFIG.phpBaseUrl + 'upload-image.php');
                    xhr.send(formData);
                    
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Error uploading image');
                    document.getElementById('editor-image-overlay').style.display = 'none';
                }
            }
        };
        
        input.click();
    }

    // Save changes to server
    async function saveChanges() {
        const saveBtn = document.getElementById('editor-save');
        const originalText = saveBtn.textContent;
        
        if (Object.keys(editedContent).length === 0) {
            updateStatus('No changes to save');
            return;
        }
        
        saveBtn.textContent = '⏳ Saving...';
        saveBtn.disabled = true;
        
        try {
            const response = await fetch(CONFIG.phpBaseUrl + 'save-content.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auth: CONFIG.password,
                    pageUrl: currentPageUrl,
                    changes: editedContent
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                saveBtn.textContent = '✅ Saved!';
                updateStatus(`Saved ${data.elementsUpdated} changes`);
                
                // Update original content with saved changes
                Object.keys(editedContent).forEach(key => {
                    originalContent[key] = editedContent[key];
                });
                
                editedContent = {};
                
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                    saveBtn.disabled = false;
                }, 2000);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error saving changes: ' + error.message);
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
            updateStatus('Error saving changes');
        }
    }

    // Discard changes
    function discardChanges() {
        if (Object.keys(editedContent).length === 0) {
            updateStatus('No changes to discard');
            return;
        }
        
        if (confirm('Are you sure you want to discard all changes?')) {
            // Restore original content
            Object.keys(editedContent).forEach(elementId => {
                const element = document.querySelector(`[data-editor-id="${elementId}"]`);
                if (element) {
                    if (element.tagName === 'IMG') {
                        element.src = originalContent[elementId];
                    } else {
                        element.innerHTML = originalContent[elementId];
                    }
                }
            });
            
            editedContent = {};
            updateStatus('Changes discarded');
        }
    }

    // Update status message
    function updateStatus(message) {
        const statusEl = document.getElementById('editor-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.opacity = '1';
            setTimeout(() => {
                statusEl.style.opacity = '0.8';
            }, 3000);
        }
    }

    // Logout
    function logout() {
        if (Object.keys(editedContent).length > 0) {
            if (!confirm('You have unsaved changes. Are you sure you want to logout?')) {
                return;
            }
        }
        
        isLoggedIn = false;
        isEditMode = false;
        sessionStorage.removeItem(CONFIG.sessionKey);
        document.body.classList.remove('editor-active');
        document.getElementById('editor-toolbar').style.display = 'none';
        document.getElementById('editor-admin-btn').style.display = 'block';
        
        // Remove contenteditable
        document.querySelectorAll('[data-editable="true"]').forEach(el => {
            el.contentEditable = 'false';
            el.removeAttribute('data-editable');
        });
        
        // Remove image click handlers
        document.querySelectorAll('img[data-editable-image="true"]').forEach(img => {
            img.removeEventListener('click', handleImageClick);
            img.removeAttribute('data-editable-image');
        });
        
        // Reset state
        editedContent = {};
        originalContent = {};
        updateStatus('Logged out');
    }

    // Add shake animation
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();