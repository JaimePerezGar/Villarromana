// ULTRA-SIMPLE CONTENT EDITOR
// Only 3 features: Edit text, Replace images, Delete elements

(function() {
    'use strict';

    let isLoggedIn = false;
    let hasChanges = false;
    let activeElement = null;

    // Initialize editor
    function init() {
        createUI();
        if (checkAuth()) {
            enableEditing();
        }
    }

    // Create minimal UI
    function createUI() {
        const header = document.querySelector('header') || document.body;
        
        const editorBar = document.createElement('div');
        editorBar.id = 'editor-bar';
        editorBar.innerHTML = `
            <button id="login-btn" class="editor-btn">🔐 Login</button>
            <div id="editor-controls" style="display: none;">
                <button id="save-btn" class="editor-btn primary">Save</button>
                <button id="exit-btn" class="editor-btn">Exit</button>
                <span id="status-msg"></span>
            </div>
        `;
        header.insertBefore(editorBar, header.firstChild);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #editor-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #333;
                color: white;
                padding: 10px;
                z-index: 10000;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .editor-btn {
                padding: 5px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                background: #555;
                color: white;
                font-size: 14px;
            }
            
            .editor-btn:hover {
                background: #666;
            }
            
            .editor-btn.primary {
                background: #4CAF50;
            }
            
            .editor-btn.primary:hover {
                background: #45a049;
            }
            
            #status-msg {
                margin-left: 10px;
                font-size: 14px;
            }
            
            body {
                margin-top: 60px !important;
            }
            
            /* Editable elements */
            [contenteditable="true"] {
                outline: 2px dashed #4CAF50;
                min-height: 20px;
            }
            
            .editable-img {
                cursor: pointer;
                position: relative;
            }
            
            .editable-img:hover {
                outline: 2px dashed #4CAF50;
            }
            
            /* Delete button */
            .delete-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                display: none;
                z-index: 1000;
            }
            
            .editable-wrapper {
                position: relative;
            }
            
            .editable-wrapper:hover .delete-btn {
                display: block;
            }
        `;
        document.head.appendChild(style);

        // Event listeners
        document.getElementById('login-btn').onclick = login;
        document.getElementById('save-btn').onclick = saveChanges;
        document.getElementById('exit-btn').onclick = exitEditor;
    }

    // Simple login
    function login() {
        const password = prompt('Enter password:');
        if (password === 'admin123') {
            isLoggedIn = true;
            localStorage.setItem('editor-auth', 'true');
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('editor-controls').style.display = 'flex';
            enableEditing();
            showStatus('Logged in - Edit mode enabled', 'success');
        } else {
            showStatus('Invalid password', 'error');
        }
    }

    // Check auth
    function checkAuth() {
        isLoggedIn = localStorage.getItem('editor-auth') === 'true';
        if (isLoggedIn) {
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('editor-controls').style.display = 'flex';
        }
        return isLoggedIn;
    }

    // Enable editing
    function enableEditing() {
        // Make text editable
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, span:not(#status-msg), a, blockquote, figcaption');
        textElements.forEach(el => {
            // Skip if inside editor bar
            if (el.closest('#editor-bar')) return;
            
            el.contentEditable = true;
            el.addEventListener('input', () => hasChanges = true);
            
            // Wrap in div for delete button
            wrapForDelete(el);
        });

        // Make images replaceable
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.classList.add('editable-img');
            img.onclick = () => replaceImage(img);
            
            // Wrap in div for delete button
            wrapForDelete(img);
        });
    }

    // Wrap element for delete button
    function wrapForDelete(element) {
        // Skip if already wrapped
        if (element.parentElement?.classList.contains('editable-wrapper')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'editable-wrapper';
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = () => {
            if (confirm('Delete this element?')) {
                wrapper.remove();
                hasChanges = true;
            }
        };
        wrapper.appendChild(deleteBtn);
    }

    // Replace image
    function replaceImage(img) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    hasChanges = true;
                    showStatus('Image updated', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    // Save changes
    async function saveChanges() {
        if (!hasChanges) {
            showStatus('No changes to save', 'info');
            return;
        }

        try {
            // Clean up before saving
            document.querySelectorAll('.delete-btn').forEach(btn => btn.remove());
            document.querySelectorAll('[contenteditable]').forEach(el => {
                el.removeAttribute('contenteditable');
            });

            // Get clean HTML
            const html = document.documentElement.outerHTML;

            // Send to server
            const response = await fetch('/php/save-html.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    html: html,
                    page: window.location.pathname
                })
            });

            if (response.ok) {
                hasChanges = false;
                showStatus('Changes saved successfully!', 'success');
                
                // Re-enable editing
                setTimeout(() => enableEditing(), 100);
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            showStatus('Error saving changes', 'error');
            console.error('Save error:', error);
            
            // Re-enable editing
            enableEditing();
        }
    }

    // Exit editor
    function exitEditor() {
        if (hasChanges && !confirm('You have unsaved changes. Exit anyway?')) {
            return;
        }
        
        localStorage.removeItem('editor-auth');
        window.location.reload();
    }

    // Show status
    function showStatus(message, type) {
        const statusMsg = document.getElementById('status-msg');
        statusMsg.textContent = message;
        statusMsg.style.color = type === 'error' ? '#f44336' : 
                               type === 'success' ? '#4CAF50' : '#fff';
        
        setTimeout(() => {
            statusMsg.textContent = '';
        }, 3000);
    }

    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();