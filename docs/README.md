# Hotel Rural Villa Romana - Sitio Web

Sitio web moderno y responsive para el Hotel Rural Villa Romana en Saldaña, Palencia.

## Características

- Diseño moderno y totalmente responsive
- **Sitio multidioma** (Español/Inglés) con selector de idioma
- Optimizado para SEO
- **Formulario de contacto con backend PHP**
- Galería de imágenes con lightbox
- Integración con Google Maps
- Sin dependencias externas (HTML, CSS y JavaScript vanilla)

## Estructura del Proyecto

```
villarromana-web/
├── index.html          # Página principal (ES)
├── css/
│   ├── styles.css      # Estilos principales
│   └── pages.css       # Estilos páginas interiores
├── js/
│   ├── main.js         # JavaScript principal
│   ├── contact.js      # Formulario contacto (ES)
│   └── contact-en.js   # Formulario contacto (EN)
├── php/
│   ├── send-contact.php # Backend formulario
│   └── config.php      # Configuración PHP
├── img/                # Imágenes (a añadir)
├── logs/               # Logs del formulario
├── pages/              # Páginas en español
│   ├── contacto.html
│   ├── instalaciones.html
│   └── ...
└── en/                 # Versión en inglés
    ├── index.html
    └── pages/
        ├── contact.html
        └── ...
```

## Despliegue en Producción

### Opción 1: Servidor Web Tradicional (Apache/Nginx)

1. Sube todos los archivos al directorio raíz de tu servidor web
2. Asegúrate de que el servidor tiene configurado index.html como archivo índice
3. No se requiere configuración adicional

### Opción 2: Hosting Estático (Recomendado)

#### Netlify
1. Crea cuenta en [Netlify](https://www.netlify.com)
2. Arrastra la carpeta `villarromana-web` al panel de Netlify
3. El sitio estará disponible inmediatamente con HTTPS gratuito

#### GitHub Pages
1. Crea un repositorio en GitHub
2. Sube todos los archivos
3. Ve a Settings > Pages
4. Selecciona la rama y carpeta raíz
5. El sitio estará en `https://[usuario].github.io/[repositorio]`

#### Vercel
1. Instala Vercel CLI: `npm i -g vercel`
2. En la carpeta del proyecto: `vercel`
3. Sigue las instrucciones

### Opción 3: Hosting Compartido (cPanel)

1. Accede a tu cPanel
2. Usa el Administrador de Archivos
3. Sube los archivos a `public_html`
4. Asegúrate de que los permisos sean 644 para archivos y 755 para carpetas

## Configuración Post-Despliegue

### 1. Imágenes
Añade las imágenes reales en la carpeta `/img/`:
- hero-1.jpg, hero-2.jpg, hero-3.jpg (imágenes del slider principal)
- room-1.jpg, room-2.jpg, room-3.jpg (habitaciones)
- nature-1.jpg a nature-4.jpg (entorno)
- Imágenes adicionales para galería

### 2. Google Maps
Actualiza las coordenadas en `pages/contacto.html`:
1. Obtén las coordenadas reales del hotel
2. Genera un nuevo embed de Google Maps
3. Reemplaza el iframe existente

### 3. Formulario de Contacto PHP
El formulario ya incluye backend PHP. Para configurarlo:

1. **Edita `/php/config.php`**:
   - Cambia `CONTACT_EMAIL` por el email real
   - Actualiza `SITE_URL` con tu dominio
   - Genera una clave segura para `FORM_SECRET`

2. **Requisitos del servidor**:
   - PHP 7.0 o superior
   - Función `mail()` habilitada
   - Permisos de escritura en `/logs/`

3. **Seguridad adicional** (opcional):
   - Implementar CAPTCHA
   - Añadir límite de envíos por IP
   - Configurar SMTP en lugar de mail()

### 4. Sistema Multidioma
El sitio incluye versiones en español e inglés:

- **Selector de idioma**: En la esquina superior derecha
- **URLs separadas**: `/` para español, `/en/` para inglés
- **Fácil expansión**: Estructura preparada para más idiomas

### 5. Información de Contacto
Actualiza en todos los archivos (ambos idiomas):
- Teléfono real
- Email real  
- Dirección exacta
- Enlaces a redes sociales

### 5. SEO Adicional

1. **Robots.txt** - Crea archivo `robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://tudominio.com/sitemap.xml
```

2. **Sitemap.xml** - Genera con herramienta online o manualmente

3. **Favicon** - Añade favicon.ico en la raíz

4. **Google Analytics** - Añade antes de `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Mantenimiento

- Las imágenes deben ser optimizadas (max 200KB para carga rápida)
- Formatos recomendados: JPEG para fotos, PNG para logos
- Tamaños recomendados:
  - Hero images: 1920x1080px
  - Room images: 800x600px
  - Thumbnails: 400x300px

## Soporte Navegadores

- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Edge (últimas 2 versiones)
- Compatible con móviles y tablets

## Licencia

Todos los derechos reservados - Hotel Rural Villa Romana 2024