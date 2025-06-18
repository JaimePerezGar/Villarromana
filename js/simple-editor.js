/**
 * Simple Editor for Villarromana
 * Ultra simple but 100% functional editor
 * 
 * Features:
 * - Login button in header
 * - Click to edit text inline
 * - Click to replace images
 * - Right-click to add content
 * - Simple save to HTML files
 * - Clear visual feedback
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        username: 'admin',
        password: 'metadrop2024',
        phpBaseUrl: window.location.pathname.includes('/en/') ? '../php/' : 'php/',
        sessionKey: 'villarromana_editor_session'
    };

    // State
    const state = {
        isLoggedIn: sessionStorage.getItem(CONFIG.sessionKey) === 'true',
        isEditMode: false,
        hasChanges: false,
        editingElement: null
    };

    // Main editor class
    class SimpleEditor {
        constructor() {
            this.loginButton = null;
            this.loginModal = null;
            this.contextMenu = null;
            this.fileInput = null;
        }

        init() {
            this.injectStyles();
            this.createLoginButton();
            this.createLoginModal();
            this.createContextMenu();
            this.createFileInput();
            this.bindEvents();

            // Show edit buttons if already logged in
            if (state.isLoggedIn) {
                this.showEditButtons();
            }
        }

        injectStyles() {
            const styles = document.createElement('style');
            styles.textContent = `
                /* Simple Editor Styles */
                .simple-editor-btn {
                    padding: 8px 16px;
                    background: #2c5530;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-family: 'Open Sans', sans-serif;
                    transition: all 0.3s ease;
                    margin-left: 15px;
                }

                .simple-editor-btn:hover {
                    background: #4a904d;
                    transform: translateY(-1px);
                }

                .simple-editor-btn.save {
                    background: #28a745;
                    margin-right: 10px;
                }

                .simple-editor-btn.save:hover {
                    background: #218838;
                }

                .simple-editor-btn.exit {
                    background: #dc3545;
                }

                .simple-editor-btn.exit:hover {
                    background: #c82333;
                }

                @media (max-width: 768px) {
                    .simple-editor-btn {
                        display: none !important;
                    }
                }

                /* Login Modal */
                .simple-editor-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }

                .simple-editor-modal-content {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    width: 90%;
                }

                .simple-editor-modal h2 {
                    margin: 0 0 30px 0;
                    color: #2c5530;
                    font-size: 24px;
                    text-align: center;
                    font-family: 'Playfair Display', serif;
                }

                .simple-editor-modal input {
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                    box-sizing: border-box;
                }

                .simple-editor-modal input:focus {
                    outline: none;
                    border-color: #4a904d;
                }

                .simple-editor-modal button {
                    width: 100%;
                    padding: 12px;
                    background: #2c5530;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .simple-editor-modal button:hover {
                    background: #4a904d;
                }

                .simple-editor-error {
                    color: #d9534f;
                    text-align: center;
                    margin-top: 15px;
                    display: none;
                }

                /* Edit Mode Styles */
                body.simple-editor-active {
                    cursor: default;
                }

                body.simple-editor-active .simple-editable {
                    outline: 2px dashed transparent;
                    outline-offset: 3px;
                    transition: all 0.3s ease;
                    min-height: 1.2em;
                    position: relative;
                }

                body.simple-editor-active .simple-editable:hover {
                    outline-color: #4a904d;
                    background-color: rgba(74, 144, 77, 0.1);
                    cursor: text;
                }

                body.simple-editor-active .simple-editable:focus {
                    outline: 2px solid #2c5530;
                    background-color: rgba(44, 85, 48, 0.1);
                }

                body.simple-editor-active .simple-editable-image {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                body.simple-editor-active .simple-editable-image:hover {
                    opacity: 0.8;
                    outline: 3px solid #4a904d;
                    outline-offset: 3px;
                }

                /* Context Menu */
                .simple-editor-context-menu {
                    position: fixed;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                    display: none;
                    z-index: 10001;
                    min-width: 160px;
                    padding: 8px 0;
                }

                .simple-editor-context-item {
                    padding: 12px 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: background 0.2s;
                    font-family: 'Open Sans', sans-serif;
                    font-size: 14px;
                }

                .simple-editor-context-item:hover {
                    background: #f5f5f5;
                }

                .simple-editor-context-item span:first-child {
                    width: 20px;
                    text-align: center;
                }

                /* Notification */
                .simple-editor-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #333;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    display: none;
                    z-index: 10001;
                    max-width: 300px;
                    font-family: 'Open Sans', sans-serif;
                }

                .simple-editor-notification.success {
                    background: #28a745;
                }

                .simple-editor-notification.error {
                    background: #dc3545;
                }

                .simple-editor-notification.warning {
                    background: #ffc107;
                    color: #000;
                }

                /* File input hidden */
                .simple-editor-file-input {
                    display: none;
                }
            `;
            document.head.appendChild(styles);
        }

        createLoginButton() {
            // Find the language selector in nav
            const langSelector = document.querySelector('.language-selector');
            if (!langSelector) return;

            // Create login button
            this.loginButton = document.createElement('button');
            this.loginButton.className = 'simple-editor-btn';
            this.loginButton.textContent = 'Editor Login';
            this.loginButton.style.display = state.isLoggedIn ? 'none' : 'block';
            
            // Insert before language selector
            langSelector.parentNode.insertBefore(this.loginButton, langSelector);

            // Bind event
            this.loginButton.addEventListener('click', () => this.showLoginModal());
        }

        createLoginModal() {
            const modal = document.createElement('div');
            modal.className = 'simple-editor-modal';
            modal.innerHTML = `
                <div class="simple-editor-modal-content">
                    <h2>Editor Login</h2>
                    <form id="simple-editor-login-form">
                        <input type="text" id="simple-editor-username" placeholder="Username" required>
                        <input type="password" id="simple-editor-password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                    <div class="simple-editor-error" id="simple-editor-error"></div>
                </div>
            `;
            document.body.appendChild(modal);
            this.loginModal = modal;

            // Bind events
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideLoginModal();
            });

            const form = modal.querySelector('#simple-editor-login-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        createContextMenu() {
            const menu = document.createElement('div');
            menu.className = 'simple-editor-context-menu';
            menu.innerHTML = `
                <div class="simple-editor-context-item" data-type="text">
                    <span>📝</span>
                    <span>Add Text</span>
                </div>
                <div class="simple-editor-context-item" data-type="image">
                    <span>🖼️</span>
                    <span>Add Image</span>
                </div>
                <div class="simple-editor-context-item" data-type="list">
                    <span>📋</span>
                    <span>Add List</span>
                </div>
            `;
            document.body.appendChild(menu);
            this.contextMenu = menu;

            // Bind events
            menu.querySelectorAll('.simple-editor-context-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const type = item.dataset.type;
                    this.addContent(type, this.contextPosition);
                    this.hideContextMenu();
                });
            });
        }

        createFileInput() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.className = 'simple-editor-file-input';
            document.body.appendChild(input);
            this.fileInput = input;

            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && this.currentImageTarget) {
                    this.replaceImage(this.currentImageTarget, file);
                }
            });
        }

        showLoginModal() {
            this.loginModal.style.display = 'flex';
            this.loginModal.querySelector('#simple-editor-username').focus();
        }

        hideLoginModal() {
            this.loginModal.style.display = 'none';
            this.loginModal.querySelector('#simple-editor-login-form').reset();
            this.loginModal.querySelector('#simple-editor-error').style.display = 'none';
        }

        handleLogin() {
            const username = this.loginModal.querySelector('#simple-editor-username').value;
            const password = this.loginModal.querySelector('#simple-editor-password').value;

            if (username === CONFIG.username && password === CONFIG.password) {
                state.isLoggedIn = true;
                sessionStorage.setItem(CONFIG.sessionKey, 'true');
                this.hideLoginModal();
                this.showEditButtons();
                this.showNotification('Login successful!', 'success');
            } else {
                const error = this.loginModal.querySelector('#simple-editor-error');
                error.textContent = 'Invalid username or password';
                error.style.display = 'block';
            }
        }

        showEditButtons() {
            // Hide login button
            this.loginButton.style.display = 'none';

            // Create save and exit buttons
            const langSelector = document.querySelector('.language-selector');
            if (!langSelector) return;

            // Save button
            this.saveButton = document.createElement('button');
            this.saveButton.className = 'simple-editor-btn save';
            this.saveButton.textContent = 'Save Changes';
            langSelector.parentNode.insertBefore(this.saveButton, langSelector);

            // Exit button
            this.exitButton = document.createElement('button');
            this.exitButton.className = 'simple-editor-btn exit';
            this.exitButton.textContent = 'Exit Editor';
            langSelector.parentNode.insertBefore(this.exitButton, langSelector);

            // Bind events
            this.saveButton.addEventListener('click', () => this.saveChanges());
            this.exitButton.addEventListener('click', () => this.exitEditor());

            // Enable edit mode
            this.enableEditMode();
        }

        enableEditMode() {
            state.isEditMode = true;
            document.body.classList.add('simple-editor-active');
            this.makeElementsEditable();
            this.showNotification('Edit mode enabled - Click text to edit, click images to replace, right-click to add content', 'success');
        }

        makeElementsEditable() {
            // Make text elements editable
            const textSelectors = 'main p, main h1, main h2, main h3, main h4, main h5, main h6, main li, main blockquote, main figcaption';
            const textElements = document.querySelectorAll(textSelectors);
            
            textElements.forEach(element => {
                // Skip if inside excluded areas
                if (element.closest('.navbar, .footer, .no-edit')) return;

                element.classList.add('simple-editable');
                element.contentEditable = 'true';
                
                // Bind events
                element.addEventListener('input', () => this.markChanged());
                element.addEventListener('focus', () => {
                    state.editingElement = element;
                });
                element.addEventListener('blur', () => {
                    state.editingElement = null;
                });
            });

            // Make images editable
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                // Skip if inside excluded areas
                if (img.closest('.navbar, .footer, .no-edit')) return;

                img.classList.add('simple-editable-image');
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.currentImageTarget = img;
                    this.fileInput.click();
                });
            });
        }

        addContent(type, position) {
            let element;
            let content = '';

            switch(type) {
                case 'text':
                    element = document.createElement('p');
                    content = 'New paragraph - click to edit';
                    break;
                case 'image':
                    this.addImageAtPosition(position);
                    return;
                case 'list':
                    element = document.createElement('ul');
                    content = '<li>First item</li><li>Second item</li>';
                    break;
            }

            if (element) {
                if (type === 'list') {
                    element.innerHTML = content;
                } else {
                    element.textContent = content;
                }

                // Insert at position
                this.insertAtPosition(element, position);

                // Make it editable
                element.classList.add('simple-editable');
                element.contentEditable = 'true';
                element.addEventListener('input', () => this.markChanged());
                
                // Focus and select content
                element.focus();
                this.selectAllText(element);
                
                this.markChanged();
                this.showNotification('Content added', 'success');
            }
        }

        addImageAtPosition(position) {
            this.contextPosition = position;
            this.fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const img = document.createElement('img');
                        img.src = ev.target.result;
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.classList.add('simple-editable-image');
                        
                        // Add click handler for future edits
                        img.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.currentImageTarget = img;
                            this.fileInput.click();
                        });

                        this.insertAtPosition(img, position);
                        this.markChanged();
                        this.showNotification('Image added', 'success');
                    };
                    reader.readAsDataURL(file);
                }
                // Reset onchange
                this.fileInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file && this.currentImageTarget) {
                        this.replaceImage(this.currentImageTarget, file);
                    }
                };
            };
            this.fileInput.click();
        }

        insertAtPosition(element, position) {
            // Find the closest container element
            let target = document.elementFromPoint(position.x, position.y);
            
            // Find a good insertion point
            while (target && !target.matches('main, section, article, div, p, h1, h2, h3, h4, h5, h6')) {
                target = target.parentElement;
            }

            if (!target) {
                target = document.querySelector('main') || document.body;
            }

            // Insert after the target element
            if (target.parentNode) {
                target.parentNode.insertBefore(element, target.nextSibling);
            } else {
                target.appendChild(element);
            }
        }

        replaceImage(img, file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
                this.markChanged();
                this.showNotification('Image replaced', 'success');
            };
            reader.readAsDataURL(file);
        }

        selectAllText(element) {
            const range = document.createRange();
            range.selectNodeContents(element);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        showContextMenu(x, y) {
            this.contextPosition = { x, y };
            this.contextMenu.style.display = 'block';
            this.contextMenu.style.left = `${x}px`;
            this.contextMenu.style.top = `${y}px`;
        }

        hideContextMenu() {
            this.contextMenu.style.display = 'none';
        }

        markChanged() {
            state.hasChanges = true;
            if (this.saveButton) {
                this.saveButton.style.background = '#ffc107';
                this.saveButton.style.color = '#000';
                this.saveButton.textContent = 'Save Changes *';
            }
        }

        async saveChanges() {
            if (!state.hasChanges) {
                this.showNotification('No changes to save', 'warning');
                return;
            }

            this.saveButton.disabled = true;
            this.saveButton.textContent = 'Saving...';

            try {
                // Clean up the HTML before saving
                const cleanHtml = this.cleanHtmlForSaving();
                
                // Get page identifier
                const pageId = this.getPageIdentifier();
                
                // Save via backend
                const response = await fetch(CONFIG.phpBaseUrl + 'save-html.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        auth: CONFIG.password,
                        page: pageId,
                        html: cleanHtml,
                        backup: true
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    state.hasChanges = false;
                    this.saveButton.style.background = '#28a745';
                    this.saveButton.style.color = 'white';
                    this.saveButton.textContent = 'Saved!';
                    this.showNotification('Changes saved successfully!', 'success');
                    
                    // Reset button after delay
                    setTimeout(() => {
                        this.saveButton.textContent = 'Save Changes';
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Save failed');
                }
            } catch (error) {
                console.error('Save error:', error);
                this.showNotification('Error saving: ' + error.message, 'error');
            } finally {
                this.saveButton.disabled = false;
            }
        }

        cleanHtmlForSaving() {
            // Clone the document
            const doc = document.cloneNode(true);
            
            // Remove editor classes and attributes
            doc.querySelectorAll('.simple-editable').forEach(el => {
                el.classList.remove('simple-editable');
                el.removeAttribute('contenteditable');
            });

            doc.querySelectorAll('.simple-editable-image').forEach(el => {
                el.classList.remove('simple-editable-image');
            });

            // Remove editor body class
            doc.body.classList.remove('simple-editor-active');

            // Remove editor buttons
            doc.querySelectorAll('.simple-editor-btn').forEach(el => el.remove());

            // Remove editor UI elements
            doc.querySelectorAll('.simple-editor-modal, .simple-editor-context-menu, .simple-editor-notification, .simple-editor-file-input').forEach(el => el.remove());

            return doc.documentElement.outerHTML;
        }

        getPageIdentifier() {
            const path = window.location.pathname;
            
            // Convert path to page identifier for backend
            if (path === '/' || path === '/index.html') {
                return 'index';
            }
            
            // Remove leading slash and .html extension, replace slashes with underscores
            return path.replace(/^\/|\.html$/g, '').replace(/\//g, '_') || 'index';
        }

        exitEditor() {
            if (state.hasChanges) {
                if (!confirm('You have unsaved changes. Are you sure you want to exit?')) {
                    return;
                }
            }
            
            // Logout and reload
            sessionStorage.removeItem(CONFIG.sessionKey);
            window.location.reload();
        }

        showNotification(message, type = 'info') {
            // Remove existing notification
            const existing = document.querySelector('.simple-editor-notification');
            if (existing) existing.remove();
            
            const notification = document.createElement('div');
            notification.className = `simple-editor-notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }

        bindEvents() {
            // Right-click context menu
            document.addEventListener('contextmenu', (e) => {
                if (state.isEditMode) {
                    e.preventDefault();
                    this.showContextMenu(e.clientX, e.clientY);
                }
            });

            // Hide context menu on click elsewhere
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.simple-editor-context-menu')) {
                    this.hideContextMenu();
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (!state.isEditMode) return;
                
                // Ctrl/Cmd + S to save
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    this.saveChanges();
                }
                
                // Escape to hide context menu
                if (e.key === 'Escape') {
                    this.hideContextMenu();
                }
            });
        }
    }

    // Initialize the editor
    const editor = new SimpleEditor();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => editor.init());
    } else {
        editor.init();
    }

    // Export for debugging
    window.SimpleEditor = editor;
})();