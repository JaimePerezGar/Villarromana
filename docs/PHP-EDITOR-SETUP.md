# PHP Editor System Setup

Este documento explica cómo configurar y usar el sistema de edición PHP para el sitio web de Hotel Rural Villarromana.

## Características

- **Autenticación segura**: Sistema de login con usuario/contraseña y captcha
- **Edición in-situ**: Edita textos e imágenes directamente en la página
- **Carga de imágenes**: Sube imágenes desde tu ordenador o usa URLs
- **Persistencia**: Los cambios se guardan en el servidor
- **Backup automático**: Cada guardado crea una copia de seguridad con fecha

## Requisitos

- Docker y Docker Compose
- Puertos 80 y 8080 disponibles
- 2GB de RAM mínimo

## Instalación

### 1. Desarrollo Local

Para ejecutar en modo desarrollo con PHP:

```bash
# Construir y ejecutar el contenedor PHP
docker-compose -f docker-compose.php.yml up -d

# Ver logs
docker-compose -f docker-compose.php.yml logs -f

# Detener
docker-compose -f docker-compose.php.yml down
```

El sitio estará disponible en: http://localhost:8080

### 2. Producción con Ambos Servicios

Para ejecutar tanto el sitio estático como el editor PHP:

```bash
# Construir y ejecutar ambos contenedores
docker-compose -f docker-compose.full.yml up -d

# Ver logs
docker-compose -f docker-compose.full.yml logs -f

# Detener
docker-compose -f docker-compose.full.yml down
```

- Sitio estático: http://localhost
- Editor PHP: http://localhost:8080

## Uso del Editor

### 1. Acceder al Modo Edición

1. Haz clic en el botón 🔐 en la esquina superior derecha
2. Introduce las credenciales:
   - Usuario: `admin`
   - Contraseña: `metadrop2024`
3. Resuelve el captcha matemático
4. Haz clic en "Entrar"

### 2. Editar Contenido

#### Textos
- **Doble clic** en cualquier texto para editarlo
- Presiona **Enter** para guardar o **Escape** para cancelar
- Para enlaces, puedes editar tanto el texto como la URL

#### Imágenes
- **Clic** en cualquier imagen para cambiarla
- Puedes:
  - Subir un archivo desde tu ordenador (máx. 10MB)
  - Usar una URL de imagen externa
  - Cambiar el texto alternativo (alt)

#### Fondos del Hero
- **Clic** en las diapositivas del hero para cambiar la imagen de fondo

### 3. Guardar Cambios

1. Haz clic en "💾 Guardar Cambios" en la barra superior
2. Los cambios se guardan en el servidor
3. Se crea automáticamente una copia de seguridad

### 4. Otras Opciones

- **👁️ Vista Previa**: Alterna entre modo edición y vista normal
- **↩️ Restaurar Original**: Vuelve al contenido original (requiere confirmación)
- **🚪 Salir**: Cierra la sesión de administrador

## Estructura de Archivos

```
villarromana-web/
├── php/                    # Backend PHP
│   ├── config.php         # Configuración
│   ├── login.php          # Autenticación
│   ├── save-content.php   # Guardar cambios
│   ├── load-content.php   # Cargar contenido
│   └── upload-image.php   # Subir imágenes
├── content/               # Contenido guardado (JSON)
│   └── backups/          # Copias de seguridad
├── img/uploads/          # Imágenes subidas
└── js/editor-php.js      # Frontend del editor
```

## Seguridad

- Las credenciales están hardcodeadas por simplicidad
- En producción, considera:
  - Usar variables de entorno para las credenciales
  - Implementar HTTPS obligatorio
  - Añadir límite de intentos de login
  - Usar tokens CSRF
  - Sanitizar todas las entradas

## Solución de Problemas

### El editor no aparece
- Verifica que el archivo `js/editor-php.js` esté cargado
- Comprueba la consola del navegador por errores
- Asegúrate de que PHP esté funcionando

### No se pueden guardar cambios
- Verifica permisos en las carpetas `content/` y `img/uploads/`
- Comprueba que PHP-FPM esté ejecutándose
- Revisa los logs del contenedor

### Las imágenes no se suben
- Verifica el tamaño del archivo (máx. 10MB)
- Comprueba el formato (JPEG, PNG, GIF, WebP)
- Revisa permisos en `img/uploads/`

## Despliegue en Coolify

Para desplegar en Coolify:

1. Usa el archivo `docker-compose.full.yml`
2. Configura las variables de entorno si es necesario
3. Asegúrate de que los volúmenes persistan entre despliegues
4. Configura los dominios apropiados (ej: edit.villarromana.com)

## Mantenimiento

### Backup Manual

```bash
# Backup de contenido
docker exec villarromana-web-php tar -czf /tmp/content-backup.tar.gz /var/www/html/content

# Copiar backup al host
docker cp villarromana-web-php:/tmp/content-backup.tar.gz ./backups/
```

### Limpiar Archivos Antiguos

```bash
# Eliminar backups de más de 30 días
find ./content/backups -type f -mtime +30 -delete

# Eliminar imágenes no utilizadas
# (requiere script adicional para verificar referencias)
```

## Notas Importantes

1. **Permisos**: Las carpetas `content/` y `img/uploads/` necesitan permisos de escritura
2. **Backups**: Se recomienda hacer backups regulares de estas carpetas
3. **Caché**: Los navegadores pueden cachear el contenido, usa Ctrl+F5 para recargar
4. **Concurrencia**: No edites desde múltiples sesiones simultáneamente