# Professional Content Editor for Villarromana

## Overview

The professional content editor is a complete, production-ready solution for editing website content directly in the browser. It provides a clean, intuitive interface that's only visible when needed.

## Key Features

### 1. **Integrated Login Button**
- Located in the header navigation (desktop only)
- Clean integration with existing site design
- Hidden on mobile devices for better UX

### 2. **Clean Edit/View Mode Separation**
- No editor UI visible to regular visitors
- Editor controls only appear after login
- Clear visual distinction between viewing and editing

### 3. **Working Insertion System**
- Click + button on any element to add content after it
- Visual insertion line shows exactly where content will be added
- Menu options: Add Text, Add Heading, Add Subheading, Add List, Add Image
- New elements are immediately editable

### 4. **Professional Toolbar**
- Fixed at top of page when in edit mode
- Clear Save/Cancel buttons
- Status indicator shows unsaved changes
- Global add buttons for quick content creation

### 5. **Complete Editing Features**
- Click any text to edit inline
- Select text to see formatting options (Bold, Italic, Underline, Links)
- Delete elements with confirmation
- Drag and drop to reorder content
- Click images to replace them
- All changes saved directly to HTML

## Usage Instructions

### Login and Access

1. **Find the Login Button**: Look for "Editor Login" button in the header (desktop only)
2. **Login Credentials**:
   - Username: `admin`
   - Password: `metadrop2024`
3. **Enable Edit Mode**: After login, click "Edit Mode" button

### Editing Content

1. **Edit Text**: 
   - Click on any paragraph or heading
   - Type to modify content
   - Select text to see formatting toolbar

2. **Add New Content**:
   - Hover over any element to see the + button
   - Click + to see insertion menu
   - Choose element type (Text, Heading, List, Image)
   - New element appears with placeholder text

3. **Delete Content**:
   - Hover over element to see × button
   - Click × and confirm deletion

4. **Reorder Content**:
   - Drag any element to new position
   - Visual indicator shows drop location

5. **Add/Replace Images**:
   - Use + button and select "Add Image"
   - Click existing images to replace them
   - Images stored as base64 in HTML

### Saving Changes

1. **Save**: Click "Save Changes" in toolbar
2. **Cancel**: Click "Cancel" to discard changes
3. **Auto-reload**: Page offers to reload after successful save

## Technical Details

### File Location
```
/js/professional-editor.js
```

### Integration
Add to any HTML page before closing `</body>` tag:
```html
<script src="js/professional-editor.js"></script>
```

### Configuration
Edit these values in the script if needed:
```javascript
const CONFIG = {
    username: 'admin',
    password: 'metadrop2024',
    phpBaseUrl: 'php/',
    editableSelectors: 'main p, main h1, main h2, ...',
    excludeSelectors: '.no-edit, .navbar, .footer, ...'
};
```

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: View-only (editing disabled)

## Security Notes

1. **Session-based**: Login persists only for browser session
2. **Client-side**: Credentials visible in source (use HTTPS)
3. **Direct saving**: Saves complete HTML file with backups

## Troubleshooting

### Login button not visible
- Check if on desktop (hidden on mobile)
- Verify script is loaded
- Check browser console for errors

### Can't edit certain elements
- Element may be in excluded selectors
- Check if element is within `main` tag
- Verify element selector in config

### Changes not saving
- Ensure PHP backend is running
- Check write permissions on HTML files
- Verify `save-html.php` exists in php folder

### Elements not draggable
- Ensure edit mode is active
- Check if element has `editable` class
- Try refreshing page

## Test Page

Visit `test-professional-editor.html` to try all features in a safe environment.

## Support

For issues or questions about the professional editor, check:
1. Browser console for errors
2. Network tab for failed requests
3. PHP error logs for backend issues