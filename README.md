# Villa Romana - Hotel Rural Website

Clean and optimized website for Hotel Rural Villarromana in Saldaña, Palencia.

## Project Structure

```
villarromana-web/
├── index.html          # Spanish homepage
├── en/                 # English version
│   └── index.html
├── pages/              # Spanish pages
├── css/
│   └── styles-clean.css # Consolidated styles
├── js/
│   ├── main-clean.js    # Main functionality
│   └── editor-clean.js  # Content editor
├── img/                # Images
├── php/                # Backend scripts
└── assets/             # Favicons
```

## Features

- Bilingual (Spanish/English)
- Responsive design
- Content editor system
- Image gallery
- Contact form
- WhatsApp integration

## Running Locally

```bash
# Start PHP server
php -S localhost:8080

# Open in browser
open http://localhost:8080
```

## Editor Access

1. Click the 🔐 Admin button
2. Login credentials:
   - Username: admin
   - Password: metadrop2024

## Clean Architecture

- Single CSS file: `styles-clean.css`
- Two JS files: `main-clean.js` and `editor-clean.js`
- No duplicate files or unused assets
- Optimized for performance