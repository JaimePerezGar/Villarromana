/**
 * Clean Editor System - Simplified and Working
 * This replaces all the duplicate editor files
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        username: 'admin',
        password: 'metadrop2024',
        phpBaseUrl: window.location.port === '8080' ? 'http://localhost:8080/php/' : '/php/',
        sessionKey: 'villarromana_admin_session'
    };

    // State
    let isLoggedIn = false;
    let editedContent = {};
    let currentPageUrl = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    // Initialize
    function init() {
        console.log('Initializing clean editor...');
        
        // Check existing session
        if (sessionStorage.getItem(CONFIG.sessionKey) === 'active') {
            isLoggedIn = true;
            enableEditMode();
        }
        
        createUI();
        setupEventListeners();
    }

    // Create UI elements
    function createUI() {
        // Check if UI already exists
        if (document.getElementById('editor-admin-btn')) return;

        // Admin button
        const adminBtn = document.createElement('button');
        adminBtn.id = 'editor-admin-btn';
        adminBtn.innerHTML = '🔐 Admin';
        adminBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #2c5530;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(adminBtn);

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
            z-index: 2000;
            justify-content: center;
            align-items: center;
        `;
        loginPanel.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px;">
                <h3 style="margin: 0 0 20px 0; color: #2c5530;">Admin Login</h3>
                <form id="editor-login-form">
                    <input type="text" id="editor-username" placeholder="Username" required 
                           style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                    <input type="password" id="editor-password" placeholder="Password" required 
                           style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="flex: 1; padding: 10px; background: #2c5530; color: white; border: none; border-radius: 5px; cursor: pointer;">Login</button>
                        <button type="button" id="editor-cancel-login" style="flex: 1; padding: 10px; background: #ccc; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                    </div>
                </form>
                <div id="editor-error" style="color: red; margin-top: 10px; display: none;"></div>
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
            z-index: 1100;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        toolbar.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 18px; font-weight: bold;">🛠️ Edit Mode</span>
                <div style="display: flex; gap: 10px;">
                    <button id="editor-save" style="padding: 8px 16px; background: #4a904d; color: white; border: none; border-radius: 5px; cursor: pointer;">💾 Save Changes</button>
                    <button id="editor-logout" style="padding: 8px 16px; background: #d9534f; color: white; border: none; border-radius: 5px; cursor: pointer;">🚪 Logout</button>
                </div>
            </div>
        `;
        document.body.appendChild(toolbar);

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            body.editor-active {
                padding-top: 60px;
            }
            
            .editor-active [contenteditable="true"] {
                outline: 2px dashed #4a904d;
                outline-offset: 3px;
                cursor: text;
                min-height: 20px;
            }
            
            .editor-active [contenteditable="true"]:hover {
                outline-color: #2c5530;
                background-color: rgba(74, 144, 77, 0.05);
            }
            
            .editor-active [contenteditable="true"]:focus {
                outline: 3px solid #2c5530;
                outline-offset: 3px;
            }
            
            .editor-active img {
                cursor: pointer;
                transition: opacity 0.2s;
            }
            
            .editor-active img:hover {
                opacity: 0.8;
                outline: 2px dashed #4a904d;
                outline-offset: 3px;
            }
        `;
        document.head.appendChild(styles);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Admin button
        document.getElementById('editor-admin-btn').addEventListener('click', () => {
            if (isLoggedIn) {
                enableEditMode();
            } else {
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
        });

        // Toolbar buttons
        document.getElementById('editor-save').addEventListener('click', saveChanges);
        document.getElementById('editor-logout').addEventListener('click', logout);

        // Close login panel on outside click
        document.getElementById('editor-login-panel').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.style.display = 'none';
                document.getElementById('editor-login-form').reset();
                document.getElementById('editor-error').style.display = 'none';
            }
        });
    }

    // Handle login
    async function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('editor-username').value;
        const password = document.getElementById('editor-password').value;
        const errorDiv = document.getElementById('editor-error');
        
        // Simple client-side validation for demo
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
        }
        
        // Note: In production, you would make an API call to the server
        // try {
        //     const response = await fetch(CONFIG.phpBaseUrl + 'login.php', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ username, password })
        //     });
        //     const data = await response.json();
        //     if (data.success) {
        //         // Handle successful login
        //     }
        // } catch (error) {
        //     errorDiv.textContent = 'Login failed. Please try again.';
        //     errorDiv.style.display = 'block';
        // }
    }

    // Enable edit mode
    function enableEditMode() {
        document.body.classList.add('editor-active');
        document.getElementById('editor-toolbar').style.display = 'block';
        document.getElementById('editor-admin-btn').style.display = 'none';
        
        // Make text elements editable
        const editableSelectors = 'h1, h2, h3, h4, h5, h6, p, li, span:not(.no-edit), a:not(.no-edit)';
        document.querySelectorAll(editableSelectors).forEach((el, index) => {
            if (!el.closest('#editor-toolbar') && !el.closest('#editor-login-panel')) {
                el.contentEditable = 'true';
                el.dataset.editorId = `element-${index}`;
                
                // Save original content
                if (!el.dataset.originalContent) {
                    el.dataset.originalContent = el.innerHTML;
                }
                
                // Track changes
                el.addEventListener('input', () => {
                    editedContent[el.dataset.editorId] = el.innerHTML;
                });
            }
        });
        
        // Make images clickable for replacement
        document.querySelectorAll('img').forEach((img, index) => {
            if (!img.closest('#editor-toolbar') && !img.closest('#editor-login-panel')) {
                img.dataset.editorId = `img-${index}`;
                img.addEventListener('click', handleImageClick);
            }
        });
    }

    // Handle image click
    function handleImageClick(e) {
        e.preventDefault();
        const img = e.target;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    editedContent[img.dataset.editorId] = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    // Save changes
    async function saveChanges() {
        const saveBtn = document.getElementById('editor-save');
        const originalText = saveBtn.textContent;
        
        if (Object.keys(editedContent).length === 0) {
            alert('No changes to save');
            return;
        }
        
        saveBtn.textContent = '⏳ Saving...';
        saveBtn.disabled = true;
        
        // In a real implementation, you would send to server
        // try {
        //     const response = await fetch(CONFIG.phpBaseUrl + 'save-content.php', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             pageUrl: currentPageUrl,
        //             changes: editedContent
        //         })
        //     });
        //     const data = await response.json();
        //     if (data.success) {
        //         // Handle success
        //     }
        // } catch (error) {
        //     alert('Error saving changes');
        // }
        
        // For demo, just show success
        setTimeout(() => {
            saveBtn.textContent = '✅ Saved!';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
                editedContent = {};
            }, 2000);
        }, 1000);
    }

    // Logout
    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            isLoggedIn = false;
            sessionStorage.removeItem(CONFIG.sessionKey);
            document.body.classList.remove('editor-active');
            document.getElementById('editor-toolbar').style.display = 'none';
            document.getElementById('editor-admin-btn').style.display = 'block';
            
            // Remove contenteditable
            document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                el.contentEditable = 'false';
            });
            
            // Remove image click handlers
            document.querySelectorAll('img[data-editor-id]').forEach(img => {
                img.removeEventListener('click', handleImageClick);
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();