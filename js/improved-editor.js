/**
 * Improved Content Editor for Villarromana
 * Modern, clean editor with enhanced UI/UX
 * 
 * Features:
 * - Clear toolbar with intuitive controls
 * - Block-based content editing
 * - Drag and drop reordering
 * - Floating format toolbar
 * - Visual insertion points
 * - Better delete confirmations
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        username: 'admin',
        password: 'metadrop2024',
        phpBaseUrl: window.location.pathname.includes('/en/') ? '../php/' : 'php/',
        sessionKey: 'villarromana_improved_editor',
        blockTypes: {
            paragraph: { label: 'Paragraph', icon: '¶', tag: 'p' },
            heading2: { label: 'Heading 2', icon: 'H2', tag: 'h2' },
            heading3: { label: 'Heading 3', icon: 'H3', tag: 'h3' },
            heading4: { label: 'Heading 4', icon: 'H4', tag: 'h4' },
            list: { label: 'Bullet List', icon: '•', tag: 'ul' },
            numberedList: { label: 'Numbered List', icon: '1.', tag: 'ol' },
            quote: { label: 'Quote', icon: '"', tag: 'blockquote' }
        }
    };

    // State Management
    class EditorState {
        constructor() {
            this.isLoggedIn = false;
            this.isEditMode = false;
            this.selectedBlock = null;
            this.changes = new Map();
            this.deletedBlocks = new Set();
            this.draggedBlock = null;
            this.pageId = this.getPageId();
        }

        getPageId() {
            const path = window.location.pathname;
            return path.replace(/^\/|\.html$/g, '').replace(/\//g, '_') || 'index';
        }

        trackChange(blockId, content) {
            this.changes.set(blockId, {
                content: content,
                timestamp: Date.now()
            });
        }

        markDeleted(blockId) {
            this.deletedBlocks.add(blockId);
            this.changes.delete(blockId);
        }

        hasChanges() {
            return this.changes.size > 0 || this.deletedBlocks.size > 0;
        }

        clearChanges() {
            this.changes.clear();
            this.deletedBlocks.clear();
        }
    }

    // Initialize state
    const state = new EditorState();

    // UI Components
    class EditorUI {
        constructor() {
            this.toolbar = null;
            this.formatBar = null;
            this.insertMenu = null;
            this.loginPanel = null;
            this.notification = null;
        }

        init() {
            this.createStyles();
            this.createLoginButton();
            this.createLoginPanel();
            this.createToolbar();
            this.createFormatBar();
            this.createInsertMenu();
            this.createNotification();
            this.bindGlobalEvents();
        }

        createStyles() {
            const styles = document.createElement('style');
            styles.textContent = `
                /* Reset and Base Styles */
                .improved-editor * {
                    box-sizing: border-box;
                }

                /* Login Button */
                .editor-login-btn {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background: #2c5530;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                    z-index: 9999;
                }

                .editor-login-btn:hover {
                    transform: scale(1.1);
                    background: #4a904d;
                }

                /* Login Panel */
                .editor-login-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }

                .editor-login-panel {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 5px 30px rgba(0,0,0,0.3);
                }

                .editor-login-panel h2 {
                    margin: 0 0 30px 0;
                    color: #2c5530;
                    font-size: 24px;
                    text-align: center;
                }

                .editor-login-panel input {
                    width: 100%;
                    padding: 12px 16px;
                    margin-bottom: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                    transition: border-color 0.3s;
                }

                .editor-login-panel input:focus {
                    outline: none;
                    border-color: #4a904d;
                }

                .editor-login-panel button {
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

                .editor-login-panel button:hover {
                    background: #4a904d;
                }

                .editor-login-error {
                    color: #d9534f;
                    text-align: center;
                    margin-top: 15px;
                    display: none;
                }

                /* Main Toolbar */
                .editor-toolbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    border-bottom: 1px solid #e0e0e0;
                    padding: 15px 20px;
                    display: none;
                    z-index: 9998;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                body.editor-active {
                    padding-top: 70px;
                }

                .editor-toolbar-content {
                    max-width: 1200px;
                    margin: 0 auto;
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

                .editor-toolbar-divider {
                    width: 1px;
                    height: 30px;
                    background: #e0e0e0;
                    margin: 0 10px;
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
                    transition: all 0.3s;
                }

                .editor-btn:hover {
                    background: #e9e9e9;
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

                /* Block Selector Dropdown */
                .editor-block-selector {
                    position: relative;
                }

                .editor-block-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    display: none;
                    min-width: 200px;
                    margin-top: 5px;
                }

                .editor-block-dropdown.active {
                    display: block;
                }

                .editor-block-option {
                    padding: 10px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: background 0.2s;
                }

                .editor-block-option:hover {
                    background: #f5f5f5;
                }

                .editor-block-icon {
                    width: 20px;
                    text-align: center;
                    font-weight: bold;
                    color: #666;
                }

                /* Content Blocks */
                .editor-block {
                    position: relative;
                    margin: 10px 0;
                    transition: all 0.3s;
                }

                body.editor-active .editor-block {
                    padding: 5px;
                    border: 2px solid transparent;
                    border-radius: 5px;
                    cursor: move;
                }

                body.editor-active .editor-block:hover {
                    border-color: #e0e0e0;
                    background: #fafafa;
                }

                body.editor-active .editor-block.selected {
                    border-color: #4a904d;
                    background: #f5faf5;
                }

                .editor-block-controls {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    display: none;
                    gap: 5px;
                }

                body.editor-active .editor-block:hover .editor-block-controls,
                body.editor-active .editor-block.selected .editor-block-controls {
                    display: flex;
                }

                .editor-block-btn {
                    width: 30px;
                    height: 30px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: all 0.2s;
                }

                .editor-block-btn:hover {
                    background: #f5f5f5;
                    border-color: #999;
                }

                .editor-block-btn.delete {
                    color: #d9534f;
                }

                .editor-block-btn.delete:hover {
                    background: #d9534f;
                    color: white;
                }

                /* Insertion Points */
                .editor-insert-point {
                    position: relative;
                    height: 30px;
                    margin: 10px 0;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }

                body.editor-active .editor-insert-point {
                    display: flex;
                }

                .editor-insert-line {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #e0e0e0;
                    transition: all 0.3s;
                }

                .editor-insert-btn {
                    position: relative;
                    width: 30px;
                    height: 30px;
                    background: white;
                    border: 2px solid #e0e0e0;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: #999;
                    transition: all 0.3s;
                    z-index: 1;
                }

                .editor-insert-point:hover .editor-insert-line {
                    background: #4a904d;
                }

                .editor-insert-point:hover .editor-insert-btn {
                    border-color: #4a904d;
                    color: #4a904d;
                    transform: scale(1.2);
                }

                /* Floating Format Bar */
                .editor-format-bar {
                    position: fixed;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 5px;
                    display: none;
                    gap: 5px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 9999;
                }

                .editor-format-btn {
                    width: 35px;
                    height: 35px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    cursor: pointer;
                    display: flex;
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

                .editor-format-divider {
                    width: 1px;
                    background: #ddd;
                    margin: 5px;
                }

                /* Insert Menu */
                .editor-insert-menu {
                    position: fixed;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-shadow: 0 2px 20px rgba(0,0,0,0.15);
                    display: none;
                    min-width: 200px;
                    z-index: 9999;
                }

                .editor-insert-menu-title {
                    padding: 10px 15px;
                    font-weight: bold;
                    border-bottom: 1px solid #e0e0e0;
                    color: #333;
                }

                .editor-insert-option {
                    padding: 10px 15px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: background 0.2s;
                }

                .editor-insert-option:hover {
                    background: #f5f5f5;
                }

                /* Image Upload */
                .editor-image-upload {
                    border: 2px dashed #ddd;
                    border-radius: 5px;
                    padding: 40px;
                    text-align: center;
                    background: #fafafa;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .editor-image-upload:hover {
                    border-color: #4a904d;
                    background: #f5faf5;
                }

                .editor-image-upload.dragover {
                    border-color: #4a904d;
                    background: #e8f5e8;
                }

                /* Dragging States */
                .editor-block.dragging {
                    opacity: 0.5;
                }

                .editor-block.drag-over {
                    border-top: 3px solid #4a904d;
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
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
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

                .editor-notification.warning {
                    background: #f0ad4e;
                }

                /* Confirmation Dialog */
                .editor-confirm {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 5px 30px rgba(0,0,0,0.3);
                    z-index: 10002;
                    display: none;
                    text-align: center;
                }

                .editor-confirm-message {
                    margin-bottom: 20px;
                    font-size: 16px;
                    color: #333;
                }

                .editor-confirm-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .editor-toolbar-content {
                        flex-wrap: wrap;
                    }

                    .editor-toolbar-group {
                        flex-wrap: wrap;
                    }

                    .editor-format-bar {
                        max-width: 90vw;
                        flex-wrap: wrap;
                    }
                }

                /* Edit Mode Indicators */
                body.editor-active [contenteditable="true"] {
                    outline: none;
                    min-height: 1em;
                }

                body.editor-active [contenteditable="true"]:focus {
                    outline: 2px solid #4a904d;
                    outline-offset: 3px;
                }

                /* Image Editor */
                body.editor-active img.editable {
                    cursor: pointer;
                    transition: opacity 0.3s;
                }

                body.editor-active img.editable:hover {
                    opacity: 0.8;
                    outline: 2px solid #4a904d;
                    outline-offset: 3px;
                }
            `;
            document.head.appendChild(styles);
        }

        createLoginButton() {
            const btn = document.createElement('button');
            btn.className = 'editor-login-btn';
            btn.innerHTML = '✏️';
            btn.title = 'Content Editor';
            document.body.appendChild(btn);

            btn.addEventListener('click', () => {
                if (state.isLoggedIn) {
                    if (state.isEditMode) {
                        this.disableEditMode();
                    } else {
                        this.enableEditMode();
                    }
                } else {
                    this.showLoginPanel();
                }
            });
        }

        createLoginPanel() {
            const overlay = document.createElement('div');
            overlay.className = 'editor-login-overlay';
            overlay.innerHTML = `
                <div class="editor-login-panel">
                    <h2>Content Editor Login</h2>
                    <form id="editor-login-form">
                        <input type="text" id="editor-username" placeholder="Username" required>
                        <input type="password" id="editor-password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                    <div class="editor-login-error" id="editor-login-error"></div>
                </div>
            `;
            document.body.appendChild(overlay);
            this.loginPanel = overlay;

            // Event listeners
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideLoginPanel();
                }
            });

            document.getElementById('editor-login-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        createToolbar() {
            const toolbar = document.createElement('div');
            toolbar.className = 'editor-toolbar';
            toolbar.innerHTML = `
                <div class="editor-toolbar-content">
                    <div class="editor-toolbar-group">
                        <div class="editor-block-selector">
                            <button class="editor-btn" id="add-block-btn">
                                <span>➕</span>
                                <span>Add Block</span>
                            </button>
                            <div class="editor-block-dropdown" id="block-dropdown"></div>
                        </div>
                        <button class="editor-btn" id="add-image-btn" title="Add Image">
                            🖼️ Image
                        </button>
                        <div class="editor-toolbar-divider"></div>
                        <button class="editor-btn" id="undo-btn" title="Undo All">
                            ↩️ Undo
                        </button>
                    </div>
                    
                    <div class="editor-toolbar-group">
                        <span id="editor-status">Ready</span>
                    </div>
                    
                    <div class="editor-toolbar-group">
                        <button class="editor-btn editor-btn-primary" id="save-btn">
                            💾 Save
                        </button>
                        <button class="editor-btn editor-btn-danger" id="cancel-btn">
                            ✖️ Cancel
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(toolbar);
            this.toolbar = toolbar;

            // Populate block dropdown
            const dropdown = document.getElementById('block-dropdown');
            Object.entries(CONFIG.blockTypes).forEach(([key, type]) => {
                const option = document.createElement('div');
                option.className = 'editor-block-option';
                option.innerHTML = `
                    <span class="editor-block-icon">${type.icon}</span>
                    <span>${type.label}</span>
                `;
                option.addEventListener('click', () => this.addBlock(key));
                dropdown.appendChild(option);
            });

            // Toolbar events
            document.getElementById('add-block-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });

            document.getElementById('add-image-btn').addEventListener('click', () => {
                this.showImageUpload();
            });

            document.getElementById('save-btn').addEventListener('click', () => {
                this.saveContent();
            });

            document.getElementById('cancel-btn').addEventListener('click', () => {
                this.confirmCancel();
            });

            document.getElementById('undo-btn').addEventListener('click', () => {
                this.undoAllChanges();
            });
        }

        createFormatBar() {
            const formatBar = document.createElement('div');
            formatBar.className = 'editor-format-bar';
            formatBar.innerHTML = `
                <button class="editor-format-btn" data-command="bold" title="Bold">B</button>
                <button class="editor-format-btn" data-command="italic" title="Italic">I</button>
                <button class="editor-format-btn" data-command="underline" title="Underline">U</button>
                <div class="editor-format-divider"></div>
                <button class="editor-format-btn" data-command="createLink" title="Link">🔗</button>
                <button class="editor-format-btn" data-command="unlink" title="Remove Link">⛓️‍💥</button>
            `;
            document.body.appendChild(formatBar);
            this.formatBar = formatBar;

            // Format button events
            formatBar.querySelectorAll('[data-command]').forEach(btn => {
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const command = btn.dataset.command;
                    if (command === 'createLink') {
                        const url = prompt('Enter URL:');
                        if (url) {
                            document.execCommand(command, false, url);
                        }
                    } else {
                        document.execCommand(command, false, null);
                    }
                });
            });
        }

        createInsertMenu() {
            const menu = document.createElement('div');
            menu.className = 'editor-insert-menu';
            menu.innerHTML = `
                <div class="editor-insert-menu-title">Insert Block</div>
            `;
            
            Object.entries(CONFIG.blockTypes).forEach(([key, type]) => {
                const option = document.createElement('div');
                option.className = 'editor-insert-option';
                option.innerHTML = `
                    <span class="editor-block-icon">${type.icon}</span>
                    <span>${type.label}</span>
                `;
                option.addEventListener('click', () => {
                    this.insertBlockAt(menu.dataset.insertAfter, key);
                    this.hideInsertMenu();
                });
                menu.appendChild(option);
            });

            document.body.appendChild(menu);
            this.insertMenu = menu;
        }

        createNotification() {
            const notification = document.createElement('div');
            notification.className = 'editor-notification';
            document.body.appendChild(notification);
            this.notification = notification;
        }

        showNotification(message, type = 'info') {
            this.notification.textContent = message;
            this.notification.className = `editor-notification ${type}`;
            this.notification.style.display = 'block';
            
            setTimeout(() => {
                this.notification.style.display = 'none';
            }, 3000);
        }

        showLoginPanel() {
            this.loginPanel.style.display = 'flex';
            document.getElementById('editor-username').focus();
        }

        hideLoginPanel() {
            this.loginPanel.style.display = 'none';
            document.getElementById('editor-login-form').reset();
            document.getElementById('editor-login-error').style.display = 'none';
        }

        handleLogin() {
            const username = document.getElementById('editor-username').value;
            const password = document.getElementById('editor-password').value;
            
            if (username === CONFIG.username && password === CONFIG.password) {
                state.isLoggedIn = true;
                sessionStorage.setItem(CONFIG.sessionKey, 'active');
                this.hideLoginPanel();
                this.enableEditMode();
            } else {
                const error = document.getElementById('editor-login-error');
                error.textContent = 'Invalid credentials';
                error.style.display = 'block';
            }
        }

        enableEditMode() {
            state.isEditMode = true;
            document.body.classList.add('editor-active');
            this.toolbar.style.display = 'block';
            document.querySelector('.editor-login-btn').innerHTML = '👁️';
            document.querySelector('.editor-login-btn').title = 'Exit Edit Mode';
            
            this.initializeBlocks();
            this.showNotification('Edit mode enabled', 'success');
        }

        disableEditMode() {
            state.isEditMode = false;
            document.body.classList.remove('editor-active');
            this.toolbar.style.display = 'none';
            document.querySelector('.editor-login-btn').innerHTML = '✏️';
            document.querySelector('.editor-login-btn').title = 'Content Editor';
            
            this.cleanupBlocks();
            this.showNotification('Edit mode disabled', 'info');
        }

        initializeBlocks() {
            // Find all content blocks
            const contentSelectors = 'p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, img, figure';
            const blocks = document.querySelectorAll(contentSelectors);
            
            blocks.forEach((block, index) => {
                // Skip if already initialized or in toolbar
                if (block.closest('.editor-toolbar, .editor-login-overlay, .editor-notification')) return;
                if (block.classList.contains('editor-block')) return;
                
                // Create block wrapper
                this.wrapBlock(block);
                
                // Add insertion point before first block
                if (index === 0) {
                    this.addInsertionPoint(block.parentElement, 'before');
                }
                
                // Add insertion point after each block
                this.addInsertionPoint(block.parentElement, 'after');
            });
        }

        wrapBlock(element) {
            // Add block class
            element.classList.add('editor-block');
            
            // Generate unique ID
            if (!element.dataset.blockId) {
                element.dataset.blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            
            // Make text blocks editable
            if (!['IMG', 'FIGURE'].includes(element.tagName)) {
                element.contentEditable = 'true';
                element.addEventListener('input', () => this.handleBlockEdit(element));
                element.addEventListener('focus', () => this.handleBlockFocus(element));
                element.addEventListener('blur', () => this.handleBlockBlur(element));
            }
            
            // Add controls
            const controls = document.createElement('div');
            controls.className = 'editor-block-controls';
            controls.innerHTML = `
                <button class="editor-block-btn" title="Move" data-action="move">⋮⋮</button>
                <button class="editor-block-btn" title="Duplicate" data-action="duplicate">📋</button>
                <button class="editor-block-btn delete" title="Delete" data-action="delete">🗑️</button>
            `;
            element.appendChild(controls);
            
            // Control events
            controls.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (btn) {
                    const action = btn.dataset.action;
                    this.handleBlockAction(element, action);
                }
            });
            
            // Make draggable
            element.draggable = true;
            element.addEventListener('dragstart', (e) => this.handleDragStart(e, element));
            element.addEventListener('dragend', (e) => this.handleDragEnd(e, element));
            element.addEventListener('dragover', (e) => this.handleDragOver(e, element));
            element.addEventListener('drop', (e) => this.handleDrop(e, element));
            
            // Handle images
            if (element.tagName === 'IMG') {
                element.classList.add('editable');
                element.addEventListener('click', () => this.handleImageClick(element));
            }
        }

        addInsertionPoint(afterElement, position) {
            const insertPoint = document.createElement('div');
            insertPoint.className = 'editor-insert-point';
            insertPoint.innerHTML = `
                <div class="editor-insert-line"></div>
                <button class="editor-insert-btn">+</button>
            `;
            
            if (position === 'before') {
                afterElement.parentNode.insertBefore(insertPoint, afterElement);
            } else {
                afterElement.parentNode.insertBefore(insertPoint, afterElement.nextSibling);
            }
            
            insertPoint.querySelector('.editor-insert-btn').addEventListener('click', () => {
                this.showInsertMenuAt(insertPoint);
            });
        }

        cleanupBlocks() {
            // Remove insertion points
            document.querySelectorAll('.editor-insert-point').forEach(point => point.remove());
            
            // Clean up blocks
            document.querySelectorAll('.editor-block').forEach(block => {
                block.classList.remove('editor-block', 'selected');
                block.contentEditable = 'false';
                block.draggable = false;
                
                // Remove controls
                const controls = block.querySelector('.editor-block-controls');
                if (controls) controls.remove();
                
                // Remove data attributes
                delete block.dataset.blockId;
            });
        }

        handleBlockEdit(block) {
            state.trackChange(block.dataset.blockId, block.innerHTML);
            this.updateStatus();
        }

        handleBlockFocus(block) {
            state.selectedBlock = block;
            block.classList.add('selected');
            this.showFormatBar();
        }

        handleBlockBlur(block) {
            block.classList.remove('selected');
            setTimeout(() => this.hideFormatBar(), 200);
        }

        handleBlockAction(block, action) {
            switch (action) {
                case 'duplicate':
                    this.duplicateBlock(block);
                    break;
                case 'delete':
                    this.confirmDelete(block);
                    break;
            }
        }

        duplicateBlock(block) {
            const clone = block.cloneNode(true);
            clone.dataset.blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Insert after original
            block.parentNode.insertBefore(clone, block.nextSibling);
            
            // Add insertion point
            this.addInsertionPoint(clone, 'after');
            
            // Re-initialize
            this.wrapBlock(clone);
            
            this.showNotification('Block duplicated', 'success');
        }

        confirmDelete(block) {
            const confirm = document.createElement('div');
            confirm.className = 'editor-confirm';
            confirm.style.display = 'block';
            confirm.innerHTML = `
                <div class="editor-confirm-message">
                    Are you sure you want to delete this block?
                </div>
                <div class="editor-confirm-buttons">
                    <button class="editor-btn editor-btn-danger" onclick="window.editorUI.deleteBlock('${block.dataset.blockId}')">Delete</button>
                    <button class="editor-btn" onclick="this.parentElement.parentElement.remove()">Cancel</button>
                </div>
            `;
            document.body.appendChild(confirm);
        }

        deleteBlock(blockId) {
            const block = document.querySelector(`[data-block-id="${blockId}"]`);
            if (block) {
                // Remove insertion point before block
                const prevInsert = block.previousElementSibling;
                if (prevInsert && prevInsert.classList.contains('editor-insert-point')) {
                    prevInsert.remove();
                }
                
                state.markDeleted(blockId);
                block.remove();
                this.updateStatus();
                this.showNotification('Block deleted', 'warning');
            }
            
            // Remove confirmation dialog
            document.querySelector('.editor-confirm').remove();
        }

        showFormatBar() {
            if (!state.selectedBlock) return;
            
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;
            
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            if (rect.width > 0) {
                this.formatBar.style.display = 'flex';
                this.formatBar.style.left = `${rect.left}px`;
                this.formatBar.style.top = `${rect.top - 50}px`;
                
                // Update button states
                this.updateFormatBarStates();
            }
        }

        hideFormatBar() {
            this.formatBar.style.display = 'none';
        }

        updateFormatBarStates() {
            this.formatBar.querySelectorAll('[data-command]').forEach(btn => {
                const command = btn.dataset.command;
                const isActive = document.queryCommandState(command);
                btn.classList.toggle('active', isActive);
            });
        }

        showInsertMenuAt(insertPoint) {
            const rect = insertPoint.getBoundingClientRect();
            this.insertMenu.style.display = 'block';
            this.insertMenu.style.left = `${rect.left}px`;
            this.insertMenu.style.top = `${rect.bottom + 5}px`;
            this.insertMenu.dataset.insertAfter = insertPoint.previousElementSibling?.dataset.blockId || 'start';
        }

        hideInsertMenu() {
            this.insertMenu.style.display = 'none';
        }

        insertBlockAt(afterBlockId, blockType) {
            const type = CONFIG.blockTypes[blockType];
            if (!type) return;
            
            const newBlock = document.createElement(type.tag);
            newBlock.textContent = `New ${type.label}`;
            newBlock.classList.add('editor-block');
            newBlock.dataset.blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            if (afterBlockId === 'start') {
                const firstBlock = document.querySelector('.editor-block');
                firstBlock.parentNode.insertBefore(newBlock, firstBlock);
            } else {
                const afterBlock = document.querySelector(`[data-block-id="${afterBlockId}"]`);
                if (afterBlock) {
                    afterBlock.parentNode.insertBefore(newBlock, afterBlock.nextSibling.nextSibling);
                }
            }
            
            // Add insertion point after new block
            this.addInsertionPoint(newBlock, 'after');
            
            // Initialize the new block
            this.wrapBlock(newBlock);
            
            // Focus it
            newBlock.focus();
            
            // Track change
            state.trackChange(newBlock.dataset.blockId, newBlock.innerHTML);
            this.updateStatus();
            
            this.showNotification(`${type.label} added`, 'success');
        }

        addBlock(blockType) {
            // Hide dropdown
            document.getElementById('block-dropdown').classList.remove('active');
            
            // Find insertion point - add at end if no selection
            const insertPoints = document.querySelectorAll('.editor-insert-point');
            const lastPoint = insertPoints[insertPoints.length - 1];
            
            if (lastPoint) {
                this.showInsertMenuAt(lastPoint);
                setTimeout(() => {
                    this.insertBlockAt(lastPoint.previousElementSibling?.dataset.blockId || 'start', blockType);
                    this.hideInsertMenu();
                }, 100);
            }
        }

        showImageUpload() {
            const dialog = document.createElement('div');
            dialog.className = 'editor-confirm';
            dialog.style.display = 'block';
            dialog.innerHTML = `
                <div class="editor-image-upload" id="image-upload-area">
                    <p>🖼️</p>
                    <p>Drag & drop an image here or click to browse</p>
                    <input type="file" accept="image/*" style="display: none" id="image-input">
                </div>
                <div class="editor-confirm-buttons">
                    <button class="editor-btn" onclick="this.parentElement.parentElement.remove()">Cancel</button>
                </div>
            `;
            document.body.appendChild(dialog);
            
            const uploadArea = dialog.querySelector('#image-upload-area');
            const input = dialog.querySelector('#image-input');
            
            uploadArea.addEventListener('click', () => input.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    this.handleImageFile(e.dataTransfer.files[0], dialog);
                }
            });
            
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImageFile(e.target.files[0], dialog);
                }
            });
        }

        handleImageFile(file, dialog) {
            if (!file.type.startsWith('image/')) {
                this.showNotification('Please select an image file', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('editor-block');
                img.dataset.blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                // Find insertion point
                const insertPoints = document.querySelectorAll('.editor-insert-point');
                const lastPoint = insertPoints[insertPoints.length - 1];
                
                if (lastPoint) {
                    lastPoint.parentNode.insertBefore(img, lastPoint);
                    this.addInsertionPoint(img, 'after');
                    this.wrapBlock(img);
                }
                
                dialog.remove();
                this.showNotification('Image added', 'success');
                state.trackChange(img.dataset.blockId, img.src);
                this.updateStatus();
            };
            reader.readAsDataURL(file);
        }

        handleImageClick(img) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                if (e.target.files.length > 0) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        img.src = ev.target.result;
                        state.trackChange(img.dataset.blockId, img.src);
                        this.updateStatus();
                        this.showNotification('Image updated', 'success');
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            };
            input.click();
        }

        // Drag and drop handlers
        handleDragStart(e, block) {
            state.draggedBlock = block;
            block.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }

        handleDragEnd(e, block) {
            block.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
        }

        handleDragOver(e, block) {
            e.preventDefault();
            if (state.draggedBlock && state.draggedBlock !== block) {
                block.classList.add('drag-over');
            }
        }

        handleDrop(e, targetBlock) {
            e.preventDefault();
            targetBlock.classList.remove('drag-over');
            
            if (state.draggedBlock && state.draggedBlock !== targetBlock) {
                // Move the dragged block before the target
                targetBlock.parentNode.insertBefore(state.draggedBlock, targetBlock);
                
                // Move insertion points
                const draggedInsert = state.draggedBlock.nextElementSibling;
                if (draggedInsert && draggedInsert.classList.contains('editor-insert-point')) {
                    state.draggedBlock.parentNode.insertBefore(draggedInsert, state.draggedBlock.nextSibling);
                }
                
                this.showNotification('Block moved', 'success');
            }
        }

        updateStatus() {
            const status = document.getElementById('editor-status');
            const changeCount = state.changes.size;
            const deleteCount = state.deletedBlocks.size;
            
            if (changeCount > 0 || deleteCount > 0) {
                status.textContent = `${changeCount} changes, ${deleteCount} deletions`;
            } else {
                status.textContent = 'No changes';
            }
        }

        async saveContent() {
            if (!state.hasChanges()) {
                this.showNotification('No changes to save', 'warning');
                return;
            }
            
            const saveBtn = document.getElementById('save-btn');
            saveBtn.disabled = true;
            saveBtn.textContent = '⏳ Saving...';
            
            try {
                // Apply deletions
                state.deletedBlocks.forEach(blockId => {
                    const block = document.querySelector(`[data-block-id="${blockId}"]`);
                    if (block) block.remove();
                });
                
                // Clean up editor artifacts
                this.cleanupForSave();
                
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
                        page: state.pageId,
                        html: html,
                        backup: true
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    state.clearChanges();
                    this.updateStatus();
                    this.showNotification('Content saved successfully!', 'success');
                    
                    setTimeout(() => {
                        if (confirm('Content saved! Reload page to see changes?')) {
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
                saveBtn.textContent = '💾 Save';
            }
        }

        cleanupForSave() {
            // Remove all editor UI elements
            document.querySelectorAll('.editor-insert-point').forEach(el => el.remove());
            document.querySelectorAll('.editor-block-controls').forEach(el => el.remove());
            
            // Clean block attributes
            document.querySelectorAll('.editor-block').forEach(block => {
                block.classList.remove('editor-block', 'selected', 'dragging');
                block.contentEditable = 'false';
                block.draggable = false;
                delete block.dataset.blockId;
            });
            
            // Remove editor classes
            document.body.classList.remove('editor-active');
        }

        confirmCancel() {
            if (state.hasChanges()) {
                if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                    this.undoAllChanges();
                    this.disableEditMode();
                }
            } else {
                this.disableEditMode();
            }
        }

        undoAllChanges() {
            if (!state.hasChanges()) {
                this.showNotification('No changes to undo', 'info');
                return;
            }
            
            if (confirm('Undo all changes? This cannot be reversed.')) {
                // Reload the page to restore original content
                window.location.reload();
            }
        }

        bindGlobalEvents() {
            // Close dropdowns on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.editor-block-selector')) {
                    document.getElementById('block-dropdown')?.classList.remove('active');
                }
                if (!e.target.closest('.editor-insert-menu')) {
                    this.hideInsertMenu();
                }
            });
            
            // Handle text selection
            document.addEventListener('selectionchange', () => {
                if (state.isEditMode && state.selectedBlock) {
                    const selection = window.getSelection();
                    if (selection.toString().length > 0) {
                        this.showFormatBar();
                    }
                }
            });
        }
    }

    // Initialize when DOM is ready
    function init() {
        // Check for existing session
        if (sessionStorage.getItem(CONFIG.sessionKey) === 'active') {
            state.isLoggedIn = true;
        }
        
        // Create UI
        window.editorUI = new EditorUI();
        window.editorUI.init();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();