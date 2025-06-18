# Advanced Editor System Guide

## Overview

The Advanced Editor System is a complete rewrite of the Villarromana website editor that addresses all previous limitations and provides a robust, flexible editing experience.

## Key Improvements Over Previous System

### 1. **No More JSON Errors**
- Saves directly to HTML files
- No JSON parsing or serialization issues
- Clean, reliable save mechanism

### 2. **Everything is Editable**
- ALL text elements (h1-h6, p, li, span, a, td, th, div, etc.)
- ALL images with click-to-replace
- Lists and individual list items
- Tables and table cells
- Buttons and links
- Even special elements like blockquotes and figure captions

### 3. **Delete Anything**
- Delete button on hover for all elements
- Special delete buttons for list items
- Confirmation before deletion
- Visual preview of deletion before save

### 4. **Robust Save System**
- Saves directly to HTML files
- Automatic backups before each save
- Success/error notifications
- No data loss or corruption

### 5. **Better User Experience**
- Visual indicators for editable elements
- Context menu (right-click) for advanced options
- Format toolbar for text styling
- Preview mode to see changes
- Undo all changes option

## How to Use

### 1. Login
- Click the 🔐 button in the navigation
- Username: `admin`
- Password: `metadrop2024`

### 2. Edit Text
- Click any text element to edit directly
- Type to make changes
- Format toolbar appears for styling options
- Changes are highlighted in yellow

### 3. Edit Images
- Click any image to replace it
- Select a new image file
- Image updates immediately
- Original is preserved until save

### 4. Delete Elements
- Hover over any element to see delete button (×)
- Click delete button
- Confirm deletion
- Element is marked for deletion (appears faded)

### 5. List Management
- Edit list items directly
- Each item has its own delete button
- Add new items by pressing Enter
- Reorder by cut/paste

### 6. Context Menu (Right-Click)
- **Edit Text**: Focus on element for editing
- **Format**: Show format toolbar
- **Duplicate**: Create a copy of the element
- **Delete**: Remove the element
- **Add Before**: Insert new element before
- **Add After**: Insert new element after

### 7. Format Toolbar
- **Bold** (Ctrl+B)
- **Italic** (Ctrl+I)
- **Underline** (Ctrl+U)
- **Align** (Left, Center, Right)
- **Lists** (Bullet, Numbered)
- **Links** (Insert, Remove)
- **Headings** (Change heading level)

### 8. Save Changes
- Click "💾 Save to HTML" in toolbar
- Confirms number of changes
- Creates automatic backup
- Saves directly to page file
- Option to reload page

### 9. Preview Mode
- Click "👁️ Preview" to toggle
- Hides all editing UI
- Shows page as it will appear
- Toggle back to continue editing

### 10. Undo Changes
- Click "↩️ Undo All" to revert
- Restores all original content
- Removes deletion marks
- Requires confirmation

## Installation

### For New Pages
Add before closing `</body>` tag:
```html
<script src="js/advanced-editor.js"></script>
```

### For Existing Pages
Run the integration script:
```bash
./scripts/integrate-advanced-editor.sh
```

Or manually replace old editor:
```html
<!-- Remove old -->
<script src="js/editor.js"></script>

<!-- Add new -->
<script src="js/advanced-editor.js"></script>
```

## Technical Details

### File Structure
```
js/
  advanced-editor.js    # Main editor system
php/
  save-html.php        # HTML save endpoint
backups/
  html/               # Automatic backups
```

### Features
- **State Management**: Tracks all changes and deletions
- **Auto-Save Reminders**: Every 30 seconds if changes exist
- **Backup System**: Keeps last 10 backups per page
- **Clean HTML**: Removes all editor artifacts on save
- **Mobile Responsive**: Works on tablets (phone editing disabled)
- **Session Persistence**: Stays logged in during session

### Security
- Password protected
- Session-based authentication
- Server-side validation
- Backup before every save

## Troubleshooting

### Changes Not Saving?
1. Check browser console for errors
2. Ensure PHP is running
3. Verify file permissions
4. Check backups/html/ directory

### Elements Not Editable?
1. Refresh page and login again
2. Check if element is in ignored list
3. Ensure JavaScript is enabled

### Can't Delete Element?
1. Some structural elements can't be deleted
2. Try using context menu instead
3. Check if element has children

### Images Not Uploading?
1. Currently uses local preview only
2. Images are embedded as data URLs
3. File size limits may apply

## Advanced Features

### Adding New Elements
1. Right-click near where you want to add
2. Choose "Add Before" or "Add After"
3. Enter element type (p, h3, div, etc.)
4. New element is created and focused

### Duplicating Content
1. Right-click element to duplicate
2. Choose "Duplicate"
3. Copy appears after original
4. Edit the copy as needed

### Changing Element Types
1. Use format toolbar dropdown
2. Select new heading level
3. Element type changes
4. Content is preserved

## Best Practices

1. **Save Frequently**: Don't accumulate too many changes
2. **Preview Before Save**: Check how changes will look
3. **Use Semantic HTML**: Choose appropriate element types
4. **Test Responsiveness**: Preview on different screen sizes
5. **Keep Backups**: System auto-backs up, but manual backups are good too

## Limitations

1. **No Undo History**: Only "undo all" available
2. **No Drag & Drop**: Use cut/paste for reordering
3. **Basic Image Handling**: No crop/resize tools
4. **Limited on Mobile**: Editor disabled on phones

## Future Enhancements

- [ ] Individual undo/redo
- [ ] Drag & drop reordering
- [ ] Image editing tools
- [ ] Collaborative editing
- [ ] Version history browser
- [ ] Custom element templates
- [ ] CSS style editor
- [ ] SEO metadata editor

## Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Test on test-advanced-editor.html
4. Contact system administrator