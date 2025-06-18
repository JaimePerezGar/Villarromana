/**
 * Professional Content Editor for Villarromana
 * Complete, production-ready editor with all features
 * 
 * Features:
 * - Login button integrated in header (desktop only)
 * - Clean edit/view mode separation
 * - Working insertion system with visual indicators
 * - Professional toolbar UI
 * - Complete content editing capabilities
 * - Direct HTML saving
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        username: 'admin',
        password: 'metadrop2024',
        phpBaseUrl: window.location.pathname.includes('/en/') ? '../php/' : 'php/',
        sessionKey: 'villarromana_editor_session',
        editableSelectors: 'main p, main h1, main h2, main h3, main h4, main ul, main ol, main blockquote, main img, main figure',
        excludeSelectors: '.no-edit, .navbar, .footer, .hero-content, .cta-button, .room-card, .feature-card'
    };

    // State Management
    class EditorState {
        constructor() {
            this.isLoggedIn = this.checkSession();
            this.isEditMode = false;
            this.selectedElement = null;
            this.originalContent = new Map();
            this.insertionTarget = null;
            this.hasChanges = false;
        }

        checkSession() {
            return sessionStorage.getItem(CONFIG.sessionKey) === 'true';
        }

        setLoggedIn(value) {
            this.isLoggedIn = value;
            sessionStorage.setItem(CONFIG.sessionKey, value ? 'true' : 'false');
        }

        saveOriginalContent(element, content) {
            if (!this.originalContent.has(element)) {
                this.originalContent.set(element, content);
            }
        }

        getOriginalContent(element) {
            return this.originalContent.get(element);
        }

        clearOriginalContent() {
            this.originalContent.clear();
        }
    }

    // Initialize state
    const state = new EditorState();

    // Main Editor Class
    class ProfessionalEditor {
        constructor() {
            this.loginModal = null;
            this.toolbar = null;
            this.insertMenu = null;
            this.formatBar = null;
            this.loginButton = null;
        }

        init() {
            this.injectStyles();
            this.createLoginButton();
            this.createLoginModal();
            this.createToolbar();
            this.createInsertMenu();
            this.createFormatBar();
            this.bindEvents();

            // Auto-enable edit mode if already logged in
            if (state.isLoggedIn) {
                this.showEditButton();
            }
        }

        injectStyles() {
            const styles = document.createElement('style');
            styles.textContent = `
                /* Editor styles - only visible when needed */
                .editor-login-nav-btn {
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

                .editor-login-nav-btn:hover {
                    background: #4a904d;
                    transform: translateY(-1px);
                }

                @media (max-width: 768px) {
                    .editor-login-nav-btn {
                        display: none !important;
                    }
                }

                /* Login Modal */
                .editor-modal-overlay {
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

                .editor-modal {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    width: 90%;
                }

                .editor-modal h2 {
                    margin: 0 0 30px 0;
                    color: #2c5530;
                    font-size: 24px;
                    text-align: center;
                    font-family: 'Playfair Display', serif;
                }

                .editor-modal input {
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                    box-sizing: border-box;
                }

                .editor-modal input:focus {
                    outline: none;
                    border-color: #4a904d;
                }

                .editor-modal button {
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

                .editor-modal button:hover {
                    background: #4a904d;
                }

                .editor-error {
                    color: #d9534f;
                    text-align: center;
                    margin-top: 15px;
                    display: none;
                }

                /* Toolbar - Fixed at top when editing */
                .editor-toolbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    border-bottom: 2px solid #e0e0e0;
                    padding: 15px 0;
                    display: none;
                    z-index: 9999;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                body.editor-active {
                    padding-top: 70px;
                }

                body.editor-active .header {
                    margin-top: 70px;
                }

                .editor-toolbar-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }

                .editor-toolbar-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .editor-btn {
                    padding: 8px 16px;
                    background: #f5f5f5;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    font-family: 'Open Sans', sans-serif;
                }

                .editor-btn:hover {
                    background: #e0e0e0;
                    transform: translateY(-1px);
                }

                .editor-btn-primary {
                    background: #2c5530;
                    color: white;
                    border-color: #2c5530;
                }

                .editor-btn-primary:hover {
                    background: #4a904d;
                    border-color: #4a904d;
                }

                .editor-btn-danger {
                    background: #d9534f;
                    color: white;
                    border-color: #d9534f;
                }

                .editor-btn-danger:hover {
                    background: #c9302c;
                    border-color: #c9302c;
                }

                /* Editable elements in edit mode */
                body.editor-active .editable {
                    position: relative;
                    outline: 2px dashed transparent;
                    outline-offset: 5px;
                    transition: all 0.3s;
                    min-height: 1.5em;
                }

                body.editor-active .editable:hover {
                    outline-color: #ddd;
                    background-color: rgba(74, 144, 77, 0.05);
                    cursor: text;
                }

                body.editor-active .editable:focus {
                    outline: 2px solid #4a904d;
                    background-color: rgba(74, 144, 77, 0.1);
                }

                body.editor-active .editable.editing {
                    outline: 2px solid #2c5530;
                    background-color: rgba(44, 85, 48, 0.05);
                }

                /* Plus button for insertion */
                .editor-add-btn {
                    position: absolute;
                    left: -40px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 30px;
                    height: 30px;
                    background: #4a904d;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s;
                    z-index: 1000;
                }

                body.editor-active .editable:hover .editor-add-btn {
                    display: flex;
                }

                .editor-add-btn:hover {
                    transform: translateY(-50%) scale(1.1);
                    background: #2c5530;
                }

                /* Insert menu */
                .editor-insert-menu {
                    position: fixed;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                    display: none;
                    z-index: 10000;
                    min-width: 200px;
                    padding: 10px 0;
                }

                .editor-insert-item {
                    padding: 10px 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: background 0.2s;
                    font-family: 'Open Sans', sans-serif;
                }

                .editor-insert-item:hover {
                    background: #f5f5f5;
                }

                .editor-insert-item-icon {
                    width: 20px;
                    text-align: center;
                }

                /* Insertion line indicator */
                .editor-insertion-line {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: #4a904d;
                    display: none;
                    z-index: 999;
                    pointer-events: none;
                }

                .editor-insertion-line::before {
                    content: '';
                    position: absolute;
                    left: -8px;
                    top: -4px;
                    width: 10px;
                    height: 10px;
                    background: #4a904d;
                    border-radius: 50%;
                }

                /* Format bar */
                .editor-format-bar {
                    position: fixed;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 5px;
                    display: none;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    z-index: 9999;
                    gap: 5px;
                }

                .editor-format-btn {
                    width: 35px;
                    height: 35px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: all 0.2s;
                }

                .editor-format-btn:hover {
                    background: #f5f5f5;
                    border-color: #999;
                }

                .editor-format-btn.active {
                    background: #4a904d;
                    color: white;
                    border-color: #4a904d;
                }

                /* Delete button */
                .editor-delete-btn {
                    position: absolute;
                    right: -40px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 30px;
                    height: 30px;
                    background: #d9534f;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s;
                    z-index: 1000;
                }

                body.editor-active .editable:hover .editor-delete-btn {
                    display: flex;
                }

                .editor-delete-btn:hover {
                    transform: translateY(-50%) scale(1.1);
                    background: #c9302c;
                }

                /* Notification */
                .editor-notification {
                    position: fixed;
                    top: 90px;
                    right: 20px;
                    background: #333;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    display: none;
                    z-index: 10001;
                    max-width: 300px;
                }

                .editor-notification.success {
                    background: #5cb85c;
                }

                .editor-notification.error {
                    background: #d9534f;
                }

                /* Drag and drop */
                body.editor-active .editable.dragging {
                    opacity: 0.5;
                }

                body.editor-active .editable.drag-over {
                    border-top: 3px solid #4a904d;
                }

                /* Image editing */
                body.editor-active img.editable {
                    cursor: pointer;
                    position: relative;
                }

                body.editor-active img.editable:hover {
                    opacity: 0.9;
                }

                /* Status indicator */
                .editor-status {
                    padding: 5px 10px;
                    background: #f0f0f0;
                    border-radius: 3px;
                    font-size: 13px;
                    color: #666;
                }

                .editor-status.changed {
                    background: #fff3cd;
                    color: #856404;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .editor-toolbar-inner {
                        flex-wrap: wrap;
                        gap: 10px;
                    }

                    .editor-add-btn,
                    .editor-delete-btn {
                        position: static;
                        transform: none;
                        margin: 5px;
                    }
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
            this.loginButton.className = 'editor-login-nav-btn';
            this.loginButton.textContent = 'Editor Login';
            this.loginButton.style.display = state.isLoggedIn ? 'none' : 'block';
            
            // Insert before language selector
            langSelector.parentNode.insertBefore(this.loginButton, langSelector);

            // Create edit mode button (initially hidden)
            this.editButton = document.createElement('button');
            this.editButton.className = 'editor-login-nav-btn';
            this.editButton.textContent = 'Edit Mode';
            this.editButton.style.display = 'none';
            langSelector.parentNode.insertBefore(this.editButton, langSelector);

            // Bind events
            this.loginButton.addEventListener('click', () => this.showLoginModal());
            this.editButton.addEventListener('click', () => this.toggleEditMode());
        }

        createLoginModal() {
            const modal = document.createElement('div');
            modal.className = 'editor-modal-overlay';
            modal.innerHTML = `
                <div class="editor-modal">
                    <h2>Editor Login</h2>
                    <form id="editor-login-form">
                        <input type="text" id="editor-username" placeholder="Username" required>
                        <input type="password" id="editor-password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                    <div class="editor-error" id="editor-error"></div>
                </div>
            `;
            document.body.appendChild(modal);
            this.loginModal = modal;

            // Bind events
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideLoginModal();
            });

            const form = modal.querySelector('#editor-login-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        createToolbar() {
            const toolbar = document.createElement('div');
            toolbar.className = 'editor-toolbar';
            toolbar.innerHTML = `
                <div class="editor-toolbar-inner">
                    <div class="editor-toolbar-group">
                        <button class="editor-btn" id="editor-add-text">
                            <span>📝</span>
                            <span>Add Text</span>
                        </button>
                        <button class="editor-btn" id="editor-add-heading">
                            <span>📌</span>
                            <span>Add Heading</span>
                        </button>
                        <button class="editor-btn" id="editor-add-image">
                            <span>🖼️</span>
                            <span>Add Image</span>
                        </button>
                    </div>
                    
                    <div class="editor-toolbar-group">
                        <div class="editor-status" id="editor-status">No changes</div>
                    </div>
                    
                    <div class="editor-toolbar-group">
                        <button class="editor-btn editor-btn-primary" id="editor-save">
                            <span>💾</span>
                            <span>Save Changes</span>
                        </button>
                        <button class="editor-btn editor-btn-danger" id="editor-cancel">
                            <span>❌</span>
                            <span>Cancel</span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(toolbar);
            this.toolbar = toolbar;

            // Bind toolbar events
            toolbar.querySelector('#editor-save').addEventListener('click', () => this.saveChanges());
            toolbar.querySelector('#editor-cancel').addEventListener('click', () => this.cancelEdit());
            toolbar.querySelector('#editor-add-text').addEventListener('click', () => this.addNewElement('p'));
            toolbar.querySelector('#editor-add-heading').addEventListener('click', () => this.addNewElement('h2'));
            toolbar.querySelector('#editor-add-image').addEventListener('click', () => this.addNewImage());
        }

        createInsertMenu() {
            const menu = document.createElement('div');
            menu.className = 'editor-insert-menu';
            menu.innerHTML = `
                <div class="editor-insert-item" data-type="p">
                    <span class="editor-insert-item-icon">📝</span>
                    <span>Add Text</span>
                </div>
                <div class="editor-insert-item" data-type="h2">
                    <span class="editor-insert-item-icon">📌</span>
                    <span>Add Heading</span>
                </div>
                <div class="editor-insert-item" data-type="h3">
                    <span class="editor-insert-item-icon">📍</span>
                    <span>Add Subheading</span>
                </div>
                <div class="editor-insert-item" data-type="ul">
                    <span class="editor-insert-item-icon">📋</span>
                    <span>Add List</span>
                </div>
                <div class="editor-insert-item" data-type="img">
                    <span class="editor-insert-item-icon">🖼️</span>
                    <span>Add Image</span>
                </div>
            `;
            document.body.appendChild(menu);
            this.insertMenu = menu;

            // Bind menu events
            menu.querySelectorAll('.editor-insert-item').forEach(item => {
                item.addEventListener('click', () => {
                    const type = item.dataset.type;
                    this.insertElement(type);
                    this.hideInsertMenu();
                });
            });

            // Create insertion line indicator
            const line = document.createElement('div');
            line.className = 'editor-insertion-line';
            document.body.appendChild(line);
            this.insertionLine = line;
        }

        createFormatBar() {
            const bar = document.createElement('div');
            bar.className = 'editor-format-bar';
            bar.innerHTML = `
                <button class="editor-format-btn" data-command="bold" title="Bold">B</button>
                <button class="editor-format-btn" data-command="italic" title="Italic">I</button>
                <button class="editor-format-btn" data-command="underline" title="Underline">U</button>
                <button class="editor-format-btn" data-command="createLink" title="Link">🔗</button>
                <button class="editor-format-btn" data-command="unlink" title="Remove Link">⛓️</button>
            `;
            document.body.appendChild(bar);
            this.formatBar = bar;

            // Bind format events
            bar.querySelectorAll('[data-command]').forEach(btn => {
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const command = btn.dataset.command;
                    if (command === 'createLink') {
                        const url = prompt('Enter URL:');
                        if (url) document.execCommand(command, false, url);
                    } else {
                        document.execCommand(command, false, null);
                    }
                    this.updateFormatBar();
                });
            });
        }

        showLoginModal() {
            this.loginModal.style.display = 'flex';
            this.loginModal.querySelector('#editor-username').focus();
        }

        hideLoginModal() {
            this.loginModal.style.display = 'none';
            this.loginModal.querySelector('#editor-login-form').reset();
            this.loginModal.querySelector('#editor-error').style.display = 'none';
        }

        handleLogin() {
            const username = this.loginModal.querySelector('#editor-username').value;
            const password = this.loginModal.querySelector('#editor-password').value;

            if (username === CONFIG.username && password === CONFIG.password) {
                state.setLoggedIn(true);
                this.hideLoginModal();
                this.showEditButton();
                this.showNotification('Login successful!', 'success');
            } else {
                const error = this.loginModal.querySelector('#editor-error');
                error.textContent = 'Invalid username or password';
                error.style.display = 'block';
            }
        }

        showEditButton() {
            this.loginButton.style.display = 'none';
            this.editButton.style.display = 'block';
        }

        toggleEditMode() {
            if (state.isEditMode) {
                this.disableEditMode();
            } else {
                this.enableEditMode();
            }
        }

        enableEditMode() {
            state.isEditMode = true;
            document.body.classList.add('editor-active');
            this.toolbar.style.display = 'block';
            this.editButton.textContent = 'Exit Edit Mode';
            
            // Make elements editable
            this.initializeEditableElements();
            
            this.showNotification('Edit mode enabled', 'success');
        }

        disableEditMode() {
            state.isEditMode = false;
            document.body.classList.remove('editor-active');
            this.toolbar.style.display = 'none';
            this.editButton.textContent = 'Edit Mode';
            
            // Clean up
            this.cleanupEditableElements();
            
            this.showNotification('Edit mode disabled', 'info');
        }

        initializeEditableElements() {
            const elements = document.querySelectorAll(CONFIG.editableSelectors);
            
            elements.forEach(element => {
                // Skip excluded elements
                if (element.closest(CONFIG.excludeSelectors)) return;
                
                // Make editable
                element.classList.add('editable');
                element.contentEditable = 'true';
                
                // Save original content
                state.saveOriginalContent(element, element.innerHTML);
                
                // Add controls
                this.addElementControls(element);
                
                // Bind events
                element.addEventListener('input', () => this.handleElementChange(element));
                element.addEventListener('focus', () => this.handleElementFocus(element));
                element.addEventListener('blur', () => this.handleElementBlur(element));
                
                // Make draggable
                element.draggable = true;
                element.addEventListener('dragstart', (e) => this.handleDragStart(e, element));
                element.addEventListener('dragend', (e) => this.handleDragEnd(e, element));
                element.addEventListener('dragover', (e) => this.handleDragOver(e, element));
                element.addEventListener('drop', (e) => this.handleDrop(e, element));
            });
        }

        addElementControls(element) {
            // Add button
            const addBtn = document.createElement('button');
            addBtn.className = 'editor-add-btn';
            addBtn.innerHTML = '+';
            addBtn.title = 'Add element after this';
            element.appendChild(addBtn);
            
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showInsertMenu(element);
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'editor-delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.title = 'Delete this element';
            element.appendChild(deleteBtn);
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteElement(element);
            });
        }

        cleanupEditableElements() {
            document.querySelectorAll('.editable').forEach(element => {
                element.classList.remove('editable', 'editing');
                element.contentEditable = 'false';
                element.draggable = false;
                
                // Remove controls
                element.querySelectorAll('.editor-add-btn, .editor-delete-btn').forEach(btn => btn.remove());
            });
            
            // Hide menus
            this.hideInsertMenu();
            this.hideFormatBar();
            
            // Clear state
            state.clearOriginalContent();
        }

        handleElementChange(element) {
            state.hasChanges = true;
            this.updateStatus();
        }

        handleElementFocus(element) {
            element.classList.add('editing');
            state.selectedElement = element;
            
            // Show format bar on selection
            document.addEventListener('selectionchange', this.selectionHandler);
        }

        handleElementBlur(element) {
            element.classList.remove('editing');
            setTimeout(() => this.hideFormatBar(), 200);
        }

        selectionHandler = () => {
            const selection = window.getSelection();
            if (selection.toString().length > 0 && state.selectedElement) {
                this.showFormatBar();
            }
        }

        showInsertMenu(afterElement) {
            state.insertionTarget = afterElement;
            
            // Position menu
            const rect = afterElement.getBoundingClientRect();
            this.insertMenu.style.display = 'block';
            this.insertMenu.style.left = `${rect.left}px`;
            this.insertMenu.style.top = `${rect.bottom + 10}px`;
            
            // Show insertion line
            this.insertionLine.style.display = 'block';
            this.insertionLine.style.top = `${rect.bottom + window.scrollY}px`;
        }

        hideInsertMenu() {
            this.insertMenu.style.display = 'none';
            this.insertionLine.style.display = 'none';
            state.insertionTarget = null;
        }

        insertElement(type) {
            if (!state.insertionTarget) return;
            
            let newElement;
            
            if (type === 'img') {
                this.insertImage();
                return;
            } else if (type === 'ul') {
                newElement = document.createElement('ul');
                newElement.innerHTML = '<li>List item</li>';
            } else {
                newElement = document.createElement(type);
                newElement.textContent = type === 'p' ? 'New paragraph' : 
                                       type === 'h2' ? 'New Heading' : 
                                       type === 'h3' ? 'New Subheading' : 'New content';
            }
            
            // Insert after target
            state.insertionTarget.parentNode.insertBefore(newElement, state.insertionTarget.nextSibling);
            
            // Make it editable
            newElement.classList.add('editable');
            newElement.contentEditable = 'true';
            this.addElementControls(newElement);
            
            // Focus it
            newElement.focus();
            
            // Select all text for easy replacement
            const range = document.createRange();
            range.selectNodeContents(newElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            state.hasChanges = true;
            this.updateStatus();
            this.showNotification('Element added', 'success');
        }

        insertImage() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const img = document.createElement('img');
                        img.src = ev.target.result;
                        img.className = 'editable';
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        
                        // Insert after target
                        state.insertionTarget.parentNode.insertBefore(img, state.insertionTarget.nextSibling);
                        
                        // Make it editable
                        this.addElementControls(img);
                        img.addEventListener('click', () => this.replaceImage(img));
                        
                        state.hasChanges = true;
                        this.updateStatus();
                        this.showNotification('Image added', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        }

        replaceImage(img) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        img.src = ev.target.result;
                        state.hasChanges = true;
                        this.updateStatus();
                        this.showNotification('Image updated', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        }

        deleteElement(element) {
            if (confirm('Are you sure you want to delete this element?')) {
                element.remove();
                state.hasChanges = true;
                this.updateStatus();
                this.showNotification('Element deleted', 'warning');
            }
        }

        showFormatBar() {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;
            
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            if (rect.width > 0) {
                this.formatBar.style.display = 'flex';
                this.formatBar.style.left = `${rect.left}px`;
                this.formatBar.style.top = `${rect.top - 50}px`;
                
                this.updateFormatBar();
            }
        }

        hideFormatBar() {
            this.formatBar.style.display = 'none';
        }

        updateFormatBar() {
            this.formatBar.querySelectorAll('[data-command]').forEach(btn => {
                const command = btn.dataset.command;
                const isActive = document.queryCommandState(command);
                btn.classList.toggle('active', isActive);
            });
        }

        // Drag and drop
        handleDragStart(e, element) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', element.outerHTML);
            element.classList.add('dragging');
            this.draggedElement = element;
        }

        handleDragEnd(e, element) {
            element.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
        }

        handleDragOver(e, element) {
            e.preventDefault();
            if (this.draggedElement && this.draggedElement !== element) {
                element.classList.add('drag-over');
            }
        }

        handleDrop(e, targetElement) {
            e.preventDefault();
            targetElement.classList.remove('drag-over');
            
            if (this.draggedElement && this.draggedElement !== targetElement) {
                targetElement.parentNode.insertBefore(this.draggedElement, targetElement);
                state.hasChanges = true;
                this.updateStatus();
                this.showNotification('Element moved', 'success');
            }
        }

        // Global actions
        addNewElement(type) {
            // Find last editable element
            const editables = document.querySelectorAll('.editable');
            const lastElement = editables[editables.length - 1] || document.querySelector('main');
            
            state.insertionTarget = lastElement;
            this.insertElement(type);
            this.hideInsertMenu();
        }

        addNewImage() {
            const editables = document.querySelectorAll('.editable');
            const lastElement = editables[editables.length - 1] || document.querySelector('main');
            
            state.insertionTarget = lastElement;
            this.insertImage();
            this.hideInsertMenu();
        }

        updateStatus() {
            const status = this.toolbar.querySelector('#editor-status');
            if (state.hasChanges) {
                status.textContent = 'Unsaved changes';
                status.classList.add('changed');
            } else {
                status.textContent = 'No changes';
                status.classList.remove('changed');
            }
        }

        async saveChanges() {
            if (!state.hasChanges) {
                this.showNotification('No changes to save', 'info');
                return;
            }

            const saveBtn = this.toolbar.querySelector('#editor-save');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span>⏳</span><span>Saving...</span>';

            try {
                // Clean up before saving
                this.cleanupForSave();
                
                // Get the HTML
                const html = document.documentElement.outerHTML;
                
                // Restore edit mode elements
                this.restoreAfterSave();
                
                // Save via PHP
                const response = await fetch(CONFIG.phpBaseUrl + 'save-html.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        auth: CONFIG.password,
                        page: window.location.pathname.replace(/^\/|\.html$/g, '').replace(/\//g, '_') || 'index',
                        html: html,
                        backup: true
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    state.hasChanges = false;
                    this.updateStatus();
                    this.showNotification('Changes saved successfully!', 'success');
                    
                    // Reload after a delay
                    setTimeout(() => {
                        if (confirm('Changes saved! Reload page to see the final result?')) {
                            window.location.reload();
                        }
                    }, 1000);
                } else {
                    throw new Error(result.error || 'Save failed');
                }
            } catch (error) {
                console.error('Save error:', error);
                this.showNotification('Error saving: ' + error.message, 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<span>💾</span><span>Save Changes</span>';
            }
        }

        cleanupForSave() {
            // Remove all editor-specific elements
            document.querySelectorAll('.editor-add-btn, .editor-delete-btn').forEach(el => el.remove());
            document.querySelectorAll('.editable').forEach(el => {
                el.classList.remove('editable', 'editing');
                el.contentEditable = 'false';
                el.draggable = false;
            });
            document.body.classList.remove('editor-active');
        }

        restoreAfterSave() {
            // Re-enable edit mode elements
            document.body.classList.add('editor-active');
            this.initializeEditableElements();
        }

        cancelEdit() {
            if (state.hasChanges) {
                if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                    return;
                }
            }
            
            // Reload to restore original content
            window.location.reload();
        }

        showNotification(message, type = 'info') {
            // Remove existing notification
            const existing = document.querySelector('.editor-notification');
            if (existing) existing.remove();
            
            const notification = document.createElement('div');
            notification.className = `editor-notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        bindEvents() {
            // Close menus on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.editor-insert-menu') && !e.target.closest('.editor-add-btn')) {
                    this.hideInsertMenu();
                }
            });
            
            // Update format bar on selection change
            document.addEventListener('selectionchange', () => {
                if (state.isEditMode && state.selectedElement) {
                    const selection = window.getSelection();
                    if (selection.toString().length > 0) {
                        this.showFormatBar();
                    } else {
                        this.hideFormatBar();
                    }
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
                
                // Escape to exit edit mode
                if (e.key === 'Escape') {
                    this.hideInsertMenu();
                    this.hideFormatBar();
                }
            });
        }
    }

    // Initialize the editor
    const editor = new ProfessionalEditor();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => editor.init());
    } else {
        editor.init();
    }

    // Export for debugging
    window.VillaromanaEditor = editor;
})();