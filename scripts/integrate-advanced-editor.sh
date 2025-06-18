#!/bin/bash

# Script to integrate advanced editor into all HTML pages
# This replaces the old editor.js with advanced-editor.js

echo "🚀 Integrating Advanced Editor into Villarromana Web"
echo "===================================================="

# Function to update HTML file
update_html_file() {
    local file=$1
    echo "📝 Updating: $file"
    
    # Check if file exists
    if [ ! -f "$file" ]; then
        echo "  ⚠️  File not found: $file"
        return
    fi
    
    # Check if already has advanced editor
    if grep -q "advanced-editor.js" "$file"; then
        echo "  ✅ Already has advanced editor"
        return
    fi
    
    # Replace old editor with advanced editor
    if grep -q "js/editor.js" "$file"; then
        sed -i.bak 's|<script src="[^"]*js/editor.js"></script>|<script src="js/advanced-editor.js"></script>|g' "$file"
        echo "  ✅ Replaced editor.js with advanced-editor.js"
    elif grep -q "js/editor-clean.js" "$file"; then
        sed -i.bak 's|<script src="[^"]*js/editor-clean.js"></script>|<script src="js/advanced-editor.js"></script>|g' "$file"
        echo "  ✅ Replaced editor-clean.js with advanced-editor.js"
    elif grep -q "</body>" "$file"; then
        # Add advanced editor before closing body tag
        sed -i.bak 's|</body>|    <script src="js/advanced-editor.js"></script>\n</body>|' "$file"
        echo "  ✅ Added advanced editor script"
    else
        echo "  ⚠️  Could not add editor script"
    fi
}

# Update main pages
echo ""
echo "📂 Updating Spanish pages..."
update_html_file "index.html"
update_html_file "pages/instalaciones.html"
update_html_file "pages/ubicacion.html"
update_html_file "pages/entorno.html"
update_html_file "pages/galeria.html"
update_html_file "pages/contacto.html"
update_html_file "pages/comentarios.html"

# Update English pages
echo ""
echo "📂 Updating English pages..."
update_html_file "en/index.html"
update_html_file "en/pages/facilities.html"
update_html_file "en/pages/location.html"
update_html_file "en/pages/environment.html"
update_html_file "en/pages/gallery.html"
update_html_file "en/pages/contact.html"
update_html_file "en/pages/reviews.html"

# Create backups directory for HTML files
echo ""
echo "📁 Creating HTML backups directory..."
mkdir -p backups/html

# Clean up backup files
echo ""
echo "🧹 Cleaning up backup files..."
find . -name "*.html.bak" -type f -delete

echo ""
echo "✅ Advanced Editor integration complete!"
echo ""
echo "🔐 Login credentials:"
echo "   Username: admin"
echo "   Password: metadrop2024"
echo ""
echo "📖 Test the editor at: test-advanced-editor.html"
echo ""
echo "⚡ Features:"
echo "   - Edit ALL text and images"
echo "   - Delete any element"
echo "   - Save directly to HTML"
echo "   - Automatic backups"
echo "   - No JSON errors!"