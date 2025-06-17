# Villarromana Admin Editor Guide

## Overview
The Villarromana website now includes a fully functional admin editor system that allows in-place editing of text content and image replacement.

## Features
- ✅ In-place text editing for all text elements
- ✅ Image upload and replacement
- ✅ Persistent content storage
- ✅ Works on both Spanish and English pages
- ✅ Clean, non-intrusive interface
- ✅ Session-based authentication
- ✅ Automatic content backup

## How to Use

### 1. Login
1. Click the "🔐 Admin" button in the top-right corner of any page
2. Enter credentials:
   - Username: `admin`
   - Password: `metadrop2024`

### 2. Edit Text
1. Once logged in, click on any text element to edit it
2. Text elements will have a dashed green outline when hoverable
3. Click and type to make changes
4. Changes are tracked automatically

### 3. Replace Images
1. In edit mode, hover over any image
2. Click on the image to upload a replacement
3. Select a new image file (max 10MB)
4. The image will be uploaded and replaced automatically

### 4. Save Changes
- Click the "💾 Save Changes" button in the toolbar to save all edits
- Changes are saved to JSON files in the `content/` directory
- Backups are automatically created in `content/backups/`

### 5. Discard Changes
- Click "↩️ Discard" to revert all unsaved changes
- You'll be prompted to confirm before discarding

### 6. Logout
- Click "🚪 Logout" to exit edit mode
- If you have unsaved changes, you'll be prompted to confirm

## Technical Details

### File Structure
```
/js/editor.js          - Main editor script
/php/
  ├── config.php       - Configuration and utilities
  ├── save-content.php - Saves content changes
  ├── load-content.php - Loads saved content
  └── upload-image.php - Handles image uploads
/content/              - Stored content (JSON files)
  └── backups/         - Automatic backups
/img/uploads/          - Uploaded images
```

### Content Storage
- Content is stored as JSON files named after the page URL
- Spanish pages: `index.json`, `instalaciones.json`, etc.
- English pages: `en_index.json`, `en_facilities.json`, etc.
- Each element is identified by a unique ID

### Security
- Client-side authentication (for demo purposes)
- Server-side validation for all operations
- File upload restrictions (image types only, max 10MB)
- Path sanitization to prevent directory traversal

## Testing
Open `test-editor.html` in your browser to test the editor functionality.

## Troubleshooting

### Editor not appearing
- Check browser console for JavaScript errors
- Ensure `editor.js` is loaded on the page
- Verify the script path is correct

### Cannot save changes
- Ensure PHP server is running
- Check that `content/` and `img/uploads/` directories exist and are writable
- Verify CORS headers are set in `php/config.php`

### Images not uploading
- Check file size (must be under 10MB)
- Ensure file is a valid image type (JPEG, PNG, GIF, WebP)
- Verify `img/uploads/` directory has write permissions

## Future Enhancements
- Server-side authentication with secure sessions
- User management system
- Content versioning and rollback
- Rich text editor for formatted content
- Bulk image management
- SEO metadata editing