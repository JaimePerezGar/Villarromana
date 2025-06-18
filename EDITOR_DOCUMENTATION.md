# Improved Content Editor Documentation

## Overview
The improved content editor provides a modern, intuitive interface for editing website content directly in the browser. It features a clean UI, block-based editing, drag-and-drop functionality, and visual feedback.

## Features

### 1. Clear Toolbar
- **Add Block**: Dropdown menu with options for paragraph, headings, lists, and quotes
- **Add Image**: Upload or drag & drop images
- **Undo**: Revert all changes
- **Save**: Save changes to HTML file
- **Cancel**: Exit edit mode

### 2. Block-Based Editing
- Each content element (paragraph, heading, list, image, etc.) is treated as a block
- Blocks can be edited, duplicated, deleted, or reordered
- Visual indicators show block boundaries when hovering

### 3. Insertion Points
- "+" buttons appear between blocks to add new content
- Click to open a menu with block type options
- Visual lines indicate where new content will be inserted

### 4. Floating Format Toolbar
- Appears when text is selected
- Options: Bold, Italic, Underline, Link, Remove Link
- Positioned above the selected text

### 5. Drag and Drop
- Drag blocks by their handle (⋮⋮) to reorder content
- Visual feedback shows where blocks will be dropped
- Smooth animations during reordering

### 6. Better Confirmations
- Clear confirmation dialogs for destructive actions
- Visual delete buttons with hover states
- Undo option to revert all changes

## Usage

### Getting Started
1. Click the edit button (✏️) at the bottom right of the page
2. Login with credentials:
   - Username: `admin`
   - Password: `metadrop2024`
3. The page enters edit mode with visual indicators

### Editing Content
1. **Text**: Click any text block to edit directly
2. **Formatting**: Select text to see the format toolbar
3. **Images**: Click an image to replace it
4. **Links**: Select text and use the link button (🔗)

### Adding Content
1. Click the "Add Block" button in the toolbar
2. Or use the "+" buttons between existing blocks
3. Choose the type of content to add
4. New block appears with placeholder text

### Reordering Content
1. Hover over a block to see controls
2. Click and drag the handle (⋮⋮)
3. Drop the block in its new position
4. Changes are tracked automatically

### Deleting Content
1. Hover over a block to see controls
2. Click the delete button (🗑️)
3. Confirm the deletion
4. Use "Undo" to restore if needed

### Saving Changes
1. Click "Save" in the toolbar
2. Changes are saved to the HTML file
3. Page reloads to show saved content
4. Automatic backups are created

## Technical Details

### File Structure
```
js/improved-editor.js   # Main editor script
test-improved-editor.html  # Test page
EDITOR_DOCUMENTATION.md    # This file
```

### Configuration
Edit the CONFIG object in `improved-editor.js`:
```javascript
const CONFIG = {
    username: 'admin',
    password: 'metadrop2024',
    phpBaseUrl: 'php/',
    sessionKey: 'villarromana_improved_editor',
    blockTypes: {
        // Define available block types
    }
};
```

### Block Types
- `paragraph`: Standard text paragraph
- `heading2`: H2 heading
- `heading3`: H3 heading  
- `heading4`: H4 heading
- `list`: Bullet list
- `numberedList`: Numbered list
- `quote`: Blockquote

### State Management
The editor tracks:
- Login status
- Edit mode state
- Content changes
- Deleted blocks
- Selected block
- Drag operations

### Styling
All editor styles are injected dynamically to avoid conflicts with site styles. Classes use the `editor-` prefix for namespace isolation.

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Limited support (view only recommended)

## Security
- Login required for edit access
- Session-based authentication
- Server-side validation via PHP
- Automatic logout on browser close

## Troubleshooting

### Editor not appearing
- Check browser console for errors
- Verify script is loaded: `<script src="js/improved-editor.js"></script>`
- Ensure page has proper HTML structure

### Can't save changes
- Check PHP backend is accessible
- Verify file permissions on server
- Check browser console for network errors

### Formatting not working
- Ensure contenteditable is supported
- Check for conflicting CSS styles
- Try refreshing the page

## Future Enhancements
- Undo/redo history
- Auto-save functionality
- Collaborative editing
- More block types (tables, code, etc.)
- Mobile editing support
- Keyboard shortcuts