/**
 * Advanced Editor System for Villarromana
 * A flexible, robust editor that makes everything editable
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        username: 'admin',
        password: 'metadrop2024',
        phpBaseUrl: window.location.pathname.includes('/en/') ? '../php/' : 'php/',
        sessionKey: 'villarromana_advanced_editor',
        autoSaveInterval: 30000, // Auto-save every 30 seconds
        backupBeforeSave: true,
        editableElements: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'li', 'span', 'a', 'td', 'th', 'div',
            'strong', 'em', 'b', 'i', 'u', 'blockquote',
            'figcaption', 'label', 'button', 'summary'
        ],
        ignoredSelectors: [
            '#advanced-editor-toolbar',
            '#advanced-editor-panel',
            '.editor-controls',
            '.language-selector',
            'script',
            'style',
            'noscript'
        ]
    };

    // State management
    class EditorState {
        constructor() {
            this.isLoggedIn = false;
            this.isEditMode = false;
            this.changes = new Map();
            this.originalContent = new Map();
            this.deletedElements = new Set();
            this.currentElement = null;
            this.pageIdentifier = this.getPageIdentifier();
        }

        getPageIdentifier() {
            const path = window.location.pathname;
            return path.replace(/^\/|\.html$/g, '').replace(/\//g, '_') || 'index';
        }

        trackChange(element, content) {
            const id = this.getElementId(element);
            this.changes.set(id, {
                element: element,
                content: content,
                type: element.tagName,
                timestamp: Date.now()
            });
        }

        getElementId(element) {
            if (!element.dataset.editorId) {
                element.dataset.editorId = `${this.pageIdentifier}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            return element.dataset.editorId;
        }

        markDeleted(element) {
            const id = this.getElementId(element);
            this.deletedElements.add(id);
            this.changes.delete(id); // Remove from changes if it was modified
        }

        isDeleted(element) {
            const id = this.getElementId(element);
            return this.deletedElements.has(id);
        }

        hasChanges() {
            return this.changes.size > 0 || this.deletedElements.size > 0;
        }

        clearChanges() {
            this.changes.clear();
            this.deletedElements.clear();
        }
    }

    // Editor instance
    const state = new EditorState();

    // UI Components
    class EditorUI {
        constructor() {
            this.toolbar = null;
            this.contextMenu = null;
            this.formatBar = null;
            this.notification = null;
        }

        init() {
            this.createAdminButton();
            this.createLoginPanel();
            this.createToolbar();
            this.createContextMenu();
            this.createFormatBar();
            this.createNotification();
            this.createStyles();
        }

        createAdminButton() {
            const adminBtn = document.createElement('button');
            adminBtn.id = 'advanced-editor-admin-btn';
            adminBtn.innerHTML = '🔐';
            adminBtn.title = 'Advanced Editor Login';
            adminBtn.className = 'editor-admin-button';
            
            // Insert into navigation
            const navWrapper = document.querySelector('.nav-wrapper');
            const languageSelector = document.querySelector('.language-selector');
            
            if (navWrapper && languageSelector) {
                languageSelector.parentNode.insertBefore(adminBtn, languageSelector.nextSibling);
            } else {
                document.body.appendChild(adminBtn);
            }
            
            adminBtn.addEventListener('click', () => this.handleAdminClick());
        }

        createLoginPanel() {
            const panel = document.createElement('div');
            panel.id = 'advanced-editor-login-panel';
            panel.className = 'editor-login-panel';
            panel.innerHTML = `
                <div class="editor-login-content">
                    <h3>Advanced Editor Login</h3>
                    <form id="editor-login-form">
                        <input type="text" id="editor-username" placeholder="Username" required>
                        <input type="password" id="editor-password" placeholder="Password" required>
                        <div class="editor-login-buttons">
                            <button type="submit">Login</button>
                            <button type="button" id="editor-cancel-login">Cancel</button>
                        </div>
                    </form>
                    <div id="editor-login-error" class="editor-error"></div>
                </div>
            `;
            document.body.appendChild(panel);

            // Event listeners
            document.getElementById('editor-login-form').addEventListener('submit', (e) => this.handleLogin(e));
            document.getElementById('editor-cancel-login').addEventListener('click', () => this.hideLoginPanel());
            panel.addEventListener('click', (e) => {
                if (e.target === panel) this.hideLoginPanel();
            });
        }

        createToolbar() {
            const toolbar = document.createElement('div');
            toolbar.id = 'advanced-editor-toolbar';
            toolbar.className = 'editor-toolbar';
            toolbar.innerHTML = `
                <div class="editor-toolbar-content">
                    <div class="editor-toolbar-left">
                        <span class="editor-mode-indicator">✏️ Advanced Edit Mode</span>
                        <span class="editor-page-info">${state.pageIdentifier}</span>
                    </div>
                    <div class="editor-toolbar-center">
                        <span id="editor-status" class="editor-status"></span>
                    </div>
                    <div class="editor-toolbar-right">
                        <button id="editor-save-html" class="editor-btn editor-btn-primary" title="Save to HTML">
                            💾 Save to HTML
                        </button>
                        <button id="editor-preview" class="editor-btn" title="Preview Changes">
                            👁️ Preview
                        </button>
                        <button id="editor-undo-all" class="editor-btn" title="Undo All Changes">
                            ↩️ Undo All
                        </button>
                        <button id="editor-help" class="editor-btn" title="Help">
                            ❓ Help
                        </button>
                        <button id="editor-logout" class="editor-btn editor-btn-danger" title="Logout">
                            🚪 Logout
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(toolbar);
            this.toolbar = toolbar;

            // Toolbar event listeners
            document.getElementById('editor-save-html').addEventListener('click', () => this.saveToHTML());
            document.getElementById('editor-preview').addEventListener('click', () => this.togglePreview());
            document.getElementById('editor-undo-all').addEventListener('click', () => this.undoAllChanges());
            document.getElementById('editor-help').addEventListener('click', () => this.showHelp());
            document.getElementById('editor-logout').addEventListener('click', () => this.logout());
        }

        createContextMenu() {
            const menu = document.createElement('div');
            menu.id = 'editor-context-menu';
            menu.className = 'editor-context-menu';
            menu.innerHTML = `
                <div class="context-menu-item" data-action="edit">
                    ✏️ Edit Text
                </div>
                <div class="context-menu-item" data-action="format">
                    🎨 Format
                </div>
                <div class="context-menu-item" data-action="duplicate">
                    📋 Duplicate
                </div>
                <div class="context-menu-item" data-action="delete">
                    🗑️ Delete
                </div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="add-before">
                    ⬆️ Add Element Before
                </div>
                <div class="context-menu-item" data-action="add-after">
                    ⬇️ Add Element After
                </div>
            `;
            document.body.appendChild(menu);
            this.contextMenu = menu;

            // Context menu event listeners
            menu.addEventListener('click', (e) => {
                const item = e.target.closest('.context-menu-item');
                if (item) {
                    const action = item.dataset.action;
                    this.handleContextAction(action);
                }
            });

            // Hide on outside click
            document.addEventListener('click', () => this.hideContextMenu());
        }

        createFormatBar() {
            const formatBar = document.createElement('div');
            formatBar.id = 'editor-format-bar';
            formatBar.className = 'editor-format-bar';
            formatBar.innerHTML = `
                <button data-command="bold" title="Bold">𝐁</button>
                <button data-command="italic" title="Italic">𝐼</button>
                <button data-command="underline" title="Underline">U̲</button>
                <div class="format-separator"></div>
                <button data-command="justifyLeft" title="Align Left">⬅</button>
                <button data-command="justifyCenter" title="Align Center">⬌</button>
                <button data-command="justifyRight" title="Align Right">➡</button>
                <div class="format-separator"></div>
                <button data-command="insertUnorderedList" title="Bullet List">• List</button>
                <button data-command="insertOrderedList" title="Numbered List">1. List</button>
                <div class="format-separator"></div>
                <button data-command="createLink" title="Insert Link">🔗</button>
                <button data-command="unlink" title="Remove Link">🔗̸</button>
                <div class="format-separator"></div>
                <select id="format-heading" title="Heading Level">
                    <option value="">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="h5">Heading 5</option>
                    <option value="h6">Heading 6</option>
                </select>
            `;
            document.body.appendChild(formatBar);
            this.formatBar = formatBar;

            // Format bar event listeners
            formatBar.querySelectorAll('button[data-command]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const command = btn.dataset.command;
                    if (command === 'createLink') {
                        const url = prompt('Enter URL:');
                        if (url) document.execCommand(command, false, url);
                    } else {
                        document.execCommand(command, false, null);
                    }
                });
            });

            document.getElementById('format-heading').addEventListener('change', (e) => {
                const value = e.target.value;
                if (value && state.currentElement) {
                    const newElement = document.createElement(value);
                    newElement.innerHTML = state.currentElement.innerHTML;
                    state.currentElement.parentNode.replaceChild(newElement, state.currentElement);
                    this.makeElementEditable(newElement);
                    state.trackChange(newElement, newElement.innerHTML);
                }
            });
        }

        createNotification() {
            const notification = document.createElement('div');
            notification.id = 'editor-notification';
            notification.className = 'editor-notification';
            document.body.appendChild(notification);
            this.notification = notification;
        }

        createStyles() {
            const styles = document.createElement('style');
            styles.textContent = `
                /* Admin Button */
                .editor-admin-button {
                    width: 40px;
                    height: 40px;
                    padding: 0;
                    background: #2c5530;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                    margin-left: 15px;
                    position: relative;
                    z-index: 1000;
                }

                .editor-admin-button:hover {
                    transform: scale(1.1);
                    background: #4a904d;
                }

                /* Login Panel */
                .editor-login-panel {
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
                }

                .editor-login-content {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                }

                .editor-login-content h3 {
                    margin: 0 0 20px 0;
                    color: #2c5530;
                    font-family: 'Playfair Display', serif;
                }

                .editor-login-content input {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                    font-size: 16px;
                }

                .editor-login-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .editor-login-buttons button {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background 0.3s;
                }

                .editor-login-buttons button[type="submit"] {
                    background: #2c5530;
                    color: white;
                }

                .editor-login-buttons button[type="submit"]:hover {
                    background: #4a904d;
                }

                .editor-login-buttons button[type="button"] {
                    background: #ccc;
                }

                .editor-login-buttons button[type="button"]:hover {
                    background: #999;
                }

                .editor-error {
                    color: #d9534f;
                    margin-top: 15px;
                    text-align: center;
                    display: none;
                }

                /* Toolbar */
                .editor-toolbar {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #2c5530;
                    color: white;
                    padding: 10px 20px;
                    z-index: 11000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                body.editor-mode {
                    padding-top: 60px;
                }

                .editor-toolbar-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .editor-toolbar-left,
                .editor-toolbar-center,
                .editor-toolbar-right {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .editor-mode-indicator {
                    font-weight: bold;
                    font-size: 16px;
                }

                .editor-page-info {
                    font-size: 14px;
                    opacity: 0.8;
                }

                .editor-status {
                    font-size: 14px;
                    opacity: 0.9;
                }

                .editor-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;
                    background: rgba(255,255,255,0.2);
                    color: white;
                }

                .editor-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-1px);
                }

                .editor-btn-primary {
                    background: #4a904d;
                }

                .editor-btn-primary:hover {
                    background: #5cb85c;
                }

                .editor-btn-danger {
                    background: #d9534f;
                }

                .editor-btn-danger:hover {
                    background: #c9302c;
                }

                /* Context Menu */
                .editor-context-menu {
                    display: none;
                    position: fixed;
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 12000;
                    min-width: 200px;
                    padding: 5px 0;
                }

                .context-menu-item {
                    padding: 10px 20px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .context-menu-item:hover {
                    background: #f5f5f5;
                }

                .context-menu-separator {
                    height: 1px;
                    background: #e0e0e0;
                    margin: 5px 0;
                }

                /* Format Bar */
                .editor-format-bar {
                    display: none;
                    position: fixed;
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 12000;
                    padding: 5px;
                    gap: 5px;
                    align-items: center;
                }

                .editor-format-bar button {
                    padding: 5px 10px;
                    border: 1px solid #ddd;
                    background: white;
                    cursor: pointer;
                    border-radius: 3px;
                    transition: all 0.2s;
                }

                .editor-format-bar button:hover {
                    background: #f0f0f0;
                    border-color: #999;
                }

                .format-separator {
                    width: 1px;
                    height: 20px;
                    background: #ddd;
                    margin: 0 5px;
                }

                #format-heading {
                    padding: 5px;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    background: white;
                }

                /* Editable Elements */
                .editor-mode [data-editable="true"] {
                    outline: 2px dashed #4a904d;
                    outline-offset: 3px;
                    cursor: text;
                    min-height: 20px;
                    position: relative;
                    transition: all 0.2s;
                }

                .editor-mode [data-editable="true"]:hover {
                    outline-color: #2c5530;
                    background-color: rgba(74, 144, 77, 0.05);
                }

                .editor-mode [data-editable="true"]:focus {
                    outline: 3px solid #2c5530;
                    outline-offset: 3px;
                }

                .editor-mode [data-editable="true"].editor-changed {
                    background-color: rgba(255, 243, 205, 0.3);
                }

                .editor-mode [data-editable-image="true"] {
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .editor-mode [data-editable-image="true"]:hover {
                    opacity: 0.8;
                    outline: 3px dashed #4a904d;
                    outline-offset: 5px;
                }

                /* Delete Button */
                .editor-delete-btn {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    width: 25px;
                    height: 25px;
                    background: #d9534f;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    z-index: 10;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }

                .editor-element-wrapper {
                    position: relative;
                    display: inline-block;
                }

                .editor-element-wrapper:hover .editor-delete-btn {
                    display: flex;
                }

                /* Notification */
                .editor-notification {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: #333;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    z-index: 13000;
                    display: none;
                    max-width: 300px;
                }

                .editor-notification.success {
                    background: #5cb85c;
                }

                .editor-notification.error {
                    background: #d9534f;
                }

                .editor-notification.warning {
                    background: #f0ad4e;
                }

                /* Preview Mode */
                body.editor-preview [data-editable="true"] {
                    outline: none !important;
                    cursor: default !important;
                }

                body.editor-preview .editor-delete-btn {
                    display: none !important;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .editor-admin-button {
                        display: none !important;
                    }

                    .editor-toolbar-content {
                        flex-direction: column;
                        gap: 10px;
                    }

                    .editor-toolbar-left,
                    .editor-toolbar-center,
                    .editor-toolbar-right {
                        width: 100%;
                        justify-content: center;
                        flex-wrap: wrap;
                    }

                    .editor-format-bar {
                        flex-wrap: wrap;
                        max-width: 90vw;
                    }
                }

                /* List Item Delete Button */
                .editor-list-item-delete {
                    display: inline-block;
                    margin-left: 10px;
                    padding: 2px 8px;
                    background: #d9534f;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                    vertical-align: middle;
                }

                .editor-list-item-delete:hover {
                    background: #c9302c;
                }

                /* Deleted elements preview */
                .editor-deleted {
                    opacity: 0.3;
                    text-decoration: line-through;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(styles);
        }

        // UI Methods
        handleAdminClick() {
            if (state.isLoggedIn) {
                if (!state.isEditMode) {
                    this.enableEditMode();
                }
            } else {
                this.showLoginPanel();
            }
        }

        showLoginPanel() {
            const panel = document.getElementById('advanced-editor-login-panel');
            panel.style.display = 'flex';
            document.getElementById('editor-username').focus();
        }

        hideLoginPanel() {
            const panel = document.getElementById('advanced-editor-login-panel');
            panel.style.display = 'none';
            document.getElementById('editor-login-form').reset();
            document.getElementById('editor-login-error').style.display = 'none';
        }

        async handleLogin(e) {
            e.preventDefault();
            
            const username = document.getElementById('editor-username').value;
            const password = document.getElementById('editor-password').value;
            const errorDiv = document.getElementById('editor-login-error');
            
            if (username === CONFIG.username && password === CONFIG.password) {
                state.isLoggedIn = true;
                sessionStorage.setItem(CONFIG.sessionKey, 'active');
                this.hideLoginPanel();
                this.enableEditMode();
            } else {
                errorDiv.textContent = 'Invalid credentials';
                errorDiv.style.display = 'block';
            }
        }

        enableEditMode() {
            state.isEditMode = true;
            document.body.classList.add('editor-mode');
            this.toolbar.style.display = 'block';
            document.getElementById('advanced-editor-admin-btn').style.display = 'none';
            
            this.makePageEditable();
            this.showNotification('Edit mode enabled - Click any element to edit', 'success');
        }

        makePageEditable() {
            // Make text elements editable
            CONFIG.editableElements.forEach(tag => {
                document.querySelectorAll(tag).forEach(element => {
                    if (this.shouldMakeEditable(element)) {
                        this.makeElementEditable(element);
                    }
                });
            });

            // Make images editable
            document.querySelectorAll('img').forEach(img => {
                if (this.shouldMakeEditable(img)) {
                    this.makeImageEditable(img);
                }
            });

            // Add special handling for lists
            document.querySelectorAll('ul, ol').forEach(list => {
                if (this.shouldMakeEditable(list)) {
                    this.makeListEditable(list);
                }
            });
        }

        shouldMakeEditable(element) {
            // Check if element should be ignored
            for (const selector of CONFIG.ignoredSelectors) {
                if (element.closest(selector)) {
                    return false;
                }
            }
            return true;
        }

        makeElementEditable(element) {
            const id = state.getElementId(element);
            element.setAttribute('data-editable', 'true');
            element.contentEditable = 'true';
            
            // Store original content
            if (!state.originalContent.has(id)) {
                state.originalContent.set(id, element.innerHTML);
            }

            // Add wrapper for delete button
            if (!element.parentElement.classList.contains('editor-element-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'editor-element-wrapper';
                element.parentNode.insertBefore(wrapper, element);
                wrapper.appendChild(element);

                // Add delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'editor-delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.title = 'Delete element';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.deleteElement(element);
                };
                wrapper.appendChild(deleteBtn);
            }

            // Track changes
            element.addEventListener('input', () => {
                state.trackChange(element, element.innerHTML);
                element.classList.add('editor-changed');
                this.updateStatus();
            });

            // Context menu
            element.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                state.currentElement = element;
                this.showContextMenu(e.pageX, e.pageY);
            });

            // Format bar
            element.addEventListener('focus', () => {
                state.currentElement = element;
                this.showFormatBar(element);
            });

            element.addEventListener('blur', () => {
                setTimeout(() => this.hideFormatBar(), 200);
            });

            // Prevent link navigation
            if (element.tagName === 'A') {
                element.addEventListener('click', (e) => {
                    if (state.isEditMode) {
                        e.preventDefault();
                    }
                });
            }
        }

        makeImageEditable(img) {
            const id = state.getElementId(img);
            img.setAttribute('data-editable-image', 'true');
            
            // Store original source
            if (!state.originalContent.has(id)) {
                state.originalContent.set(id, img.src);
            }

            // Add wrapper for better control
            if (!img.parentElement.classList.contains('editor-element-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'editor-element-wrapper';
                wrapper.style.display = 'inline-block';
                img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);

                // Add delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'editor-delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.title = 'Delete image';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.deleteElement(img);
                };
                wrapper.appendChild(deleteBtn);
            }

            // Click to replace
            img.addEventListener('click', (e) => {
                if (state.isEditMode) {
                    e.preventDefault();
                    this.replaceImage(img);
                }
            });

            // Context menu
            img.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                state.currentElement = img;
                this.showContextMenu(e.pageX, e.pageY);
            });
        }

        makeListEditable(list) {
            list.querySelectorAll('li').forEach(li => {
                if (!li.querySelector('.editor-list-item-delete')) {
                    // Add delete button for list items
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'editor-list-item-delete';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.title = 'Delete item';
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.deleteListItem(li);
                    };
                    li.appendChild(deleteBtn);
                }
            });
        }

        replaceImage(img) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    // Create a local preview immediately
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        img.src = e.target.result;
                        state.trackChange(img, e.target.result);
                        img.classList.add('editor-changed');
                        this.updateStatus();
                        this.showNotification('Image updated locally. Save to make permanent.', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            };
            
            input.click();
        }

        deleteElement(element) {
            if (confirm('Are you sure you want to delete this element?')) {
                state.markDeleted(element);
                element.classList.add('editor-deleted');
                this.updateStatus();
                this.showNotification('Element marked for deletion', 'warning');
            }
        }

        deleteListItem(li) {
            if (confirm('Are you sure you want to delete this list item?')) {
                state.markDeleted(li);
                li.classList.add('editor-deleted');
                this.updateStatus();
                this.showNotification('List item marked for deletion', 'warning');
            }
        }

        showContextMenu(x, y) {
            const menu = this.contextMenu;
            menu.style.display = 'block';
            menu.style.left = x + 'px';
            menu.style.top = y + 'px';

            // Adjust position if menu goes off screen
            const rect = menu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                menu.style.left = (x - rect.width) + 'px';
            }
            if (rect.bottom > window.innerHeight) {
                menu.style.top = (y - rect.height) + 'px';
            }
        }

        hideContextMenu() {
            this.contextMenu.style.display = 'none';
        }

        handleContextAction(action) {
            if (!state.currentElement) return;

            switch (action) {
                case 'edit':
                    state.currentElement.focus();
                    break;
                case 'format':
                    this.showFormatBar(state.currentElement);
                    break;
                case 'duplicate':
                    this.duplicateElement(state.currentElement);
                    break;
                case 'delete':
                    this.deleteElement(state.currentElement);
                    break;
                case 'add-before':
                    this.addElement('before');
                    break;
                case 'add-after':
                    this.addElement('after');
                    break;
            }
            
            this.hideContextMenu();
        }

        duplicateElement(element) {
            const clone = element.cloneNode(true);
            const wrapper = element.closest('.editor-element-wrapper');
            
            if (wrapper) {
                const newWrapper = wrapper.cloneNode(false);
                wrapper.parentNode.insertBefore(newWrapper, wrapper.nextSibling);
                newWrapper.appendChild(clone);
                this.makeElementEditable(clone);
            } else {
                element.parentNode.insertBefore(clone, element.nextSibling);
                this.makeElementEditable(clone);
            }
            
            this.showNotification('Element duplicated', 'success');
        }

        addElement(position) {
            const type = prompt('Enter element type (p, h2, h3, div, etc.):');
            if (!type) return;

            const newElement = document.createElement(type);
            newElement.textContent = 'New ' + type + ' element';
            
            const wrapper = state.currentElement.closest('.editor-element-wrapper');
            const reference = wrapper || state.currentElement;
            
            if (position === 'before') {
                reference.parentNode.insertBefore(newElement, reference);
            } else {
                reference.parentNode.insertBefore(newElement, reference.nextSibling);
            }
            
            this.makeElementEditable(newElement);
            newElement.focus();
            this.showNotification('New element added', 'success');
        }

        showFormatBar(element) {
            if (element.tagName === 'IMG') return;
            
            const rect = element.getBoundingClientRect();
            const bar = this.formatBar;
            
            bar.style.display = 'flex';
            bar.style.left = rect.left + 'px';
            bar.style.top = (rect.top - 50) + 'px';
            
            // Update heading selector
            const headingSelect = document.getElementById('format-heading');
            headingSelect.value = element.tagName.toLowerCase();
        }

        hideFormatBar() {
            this.formatBar.style.display = 'none';
        }

        showNotification(message, type = 'info') {
            const notification = this.notification;
            notification.textContent = message;
            notification.className = 'editor-notification ' + type;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }

        updateStatus() {
            const status = document.getElementById('editor-status');
            const changeCount = state.changes.size;
            const deleteCount = state.deletedElements.size;
            
            if (changeCount > 0 || deleteCount > 0) {
                status.textContent = `${changeCount} changes, ${deleteCount} deletions pending`;
            } else {
                status.textContent = 'No changes';
            }
        }

        async saveToHTML() {
            if (!state.hasChanges()) {
                this.showNotification('No changes to save', 'warning');
                return;
            }

            const saveBtn = document.getElementById('editor-save-html');
            saveBtn.disabled = true;
            saveBtn.textContent = '⏳ Saving...';

            try {
                // Apply all changes to the DOM
                this.applyChangesToDOM();

                // Get the entire HTML
                const html = document.documentElement.outerHTML;

                // Save via PHP
                const response = await fetch(CONFIG.phpBaseUrl + 'save-html.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        auth: CONFIG.password,
                        page: state.pageIdentifier,
                        html: html,
                        backup: CONFIG.backupBeforeSave
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    state.clearChanges();
                    this.updateStatus();
                    this.showNotification('Changes saved successfully!', 'success');
                    
                    // Reload page after short delay
                    setTimeout(() => {
                        if (confirm('Page saved! Reload to see changes?')) {
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
                saveBtn.textContent = '💾 Save to HTML';
            }
        }

        applyChangesToDOM() {
            // Remove deleted elements
            state.deletedElements.forEach(id => {
                const element = document.querySelector(`[data-editor-id="${id}"]`);
                if (element) {
                    const wrapper = element.closest('.editor-element-wrapper');
                    if (wrapper) {
                        wrapper.remove();
                    } else {
                        element.remove();
                    }
                }
            });

            // Clean up editor attributes before saving
            document.querySelectorAll('[data-editable]').forEach(el => {
                el.removeAttribute('data-editable');
                el.removeAttribute('contenteditable');
                el.classList.remove('editor-changed');
            });

            document.querySelectorAll('[data-editable-image]').forEach(img => {
                img.removeAttribute('data-editable-image');
            });

            document.querySelectorAll('[data-editor-id]').forEach(el => {
                el.removeAttribute('data-editor-id');
            });

            // Remove editor wrappers
            document.querySelectorAll('.editor-element-wrapper').forEach(wrapper => {
                const child = wrapper.firstElementChild;
                if (child && !child.classList.contains('editor-delete-btn')) {
                    wrapper.parentNode.insertBefore(child, wrapper);
                    wrapper.remove();
                }
            });

            // Remove list item delete buttons
            document.querySelectorAll('.editor-list-item-delete').forEach(btn => {
                btn.remove();
            });

            // Remove deleted class
            document.querySelectorAll('.editor-deleted').forEach(el => {
                el.remove();
            });
        }

        togglePreview() {
            document.body.classList.toggle('editor-preview');
            const previewBtn = document.getElementById('editor-preview');
            
            if (document.body.classList.contains('editor-preview')) {
                previewBtn.textContent = '✏️ Edit';
                this.showNotification('Preview mode - Editing disabled', 'info');
            } else {
                previewBtn.textContent = '👁️ Preview';
                this.showNotification('Edit mode restored', 'info');
            }
        }

        undoAllChanges() {
            if (!state.hasChanges()) {
                this.showNotification('No changes to undo', 'info');
                return;
            }

            if (confirm('Undo all changes? This cannot be reversed.')) {
                // Restore original content
                state.changes.forEach((change, id) => {
                    const element = document.querySelector(`[data-editor-id="${id}"]`);
                    if (element && state.originalContent.has(id)) {
                        if (element.tagName === 'IMG') {
                            element.src = state.originalContent.get(id);
                        } else {
                            element.innerHTML = state.originalContent.get(id);
                        }
                        element.classList.remove('editor-changed');
                    }
                });

                // Restore deleted elements
                document.querySelectorAll('.editor-deleted').forEach(el => {
                    el.classList.remove('editor-deleted');
                });

                state.clearChanges();
                this.updateStatus();
                this.showNotification('All changes undone', 'success');
            }
        }

        showHelp() {
            const helpText = `
Advanced Editor Help:

📝 Text Editing:
- Click any text to edit directly
- Use the format bar for styling
- Right-click for more options

🖼️ Images:
- Click any image to replace it
- Use delete button to remove

📋 Lists:
- Edit list items individually
- Use × button to delete items

💾 Saving:
- "Save to HTML" saves directly to the page file
- Creates automatic backups
- Changes are permanent after save

⌨️ Shortcuts:
- Ctrl+B: Bold
- Ctrl+I: Italic
- Ctrl+U: Underline
- Right-click: Context menu

🔄 Undo:
- "Undo All" reverts all pending changes
- Individual changes can't be undone yet

Need more help? Contact support.
            `;
            
            alert(helpText);
        }

        logout() {
            if (state.hasChanges()) {
                if (!confirm('You have unsaved changes. Logout anyway?')) {
                    return;
                }
            }

            state.isLoggedIn = false;
            state.isEditMode = false;
            sessionStorage.removeItem(CONFIG.sessionKey);
            
            // Clean up UI
            document.body.classList.remove('editor-mode');
            document.body.classList.remove('editor-preview');
            this.toolbar.style.display = 'none';
            document.getElementById('advanced-editor-admin-btn').style.display = 'flex';
            
            // Remove all editable attributes
            document.querySelectorAll('[data-editable]').forEach(el => {
                el.removeAttribute('data-editable');
                el.contentEditable = 'false';
            });
            
            // Clean up wrappers and buttons
            document.querySelectorAll('.editor-element-wrapper').forEach(wrapper => {
                const child = wrapper.firstElementChild;
                if (child && !child.classList.contains('editor-delete-btn')) {
                    wrapper.parentNode.insertBefore(child, wrapper);
                    wrapper.remove();
                }
            });
            
            document.querySelectorAll('.editor-delete-btn').forEach(btn => btn.remove());
            document.querySelectorAll('.editor-list-item-delete').forEach(btn => btn.remove());
            
            // Reset state
            state.clearChanges();
            state.originalContent.clear();
            
            this.showNotification('Logged out successfully', 'info');
        }
    }

    // Initialize
    function init() {
        // Check session
        if (sessionStorage.getItem(CONFIG.sessionKey) === 'active') {
            state.isLoggedIn = true;
        }

        const ui = new EditorUI();
        ui.init();

        // Auto-save timer
        if (CONFIG.autoSaveInterval > 0) {
            setInterval(() => {
                if (state.isEditMode && state.hasChanges()) {
                    ui.showNotification('Auto-save available. Click "Save to HTML" to save.', 'info');
                }
            }, CONFIG.autoSaveInterval);
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();