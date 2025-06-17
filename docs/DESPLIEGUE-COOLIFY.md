# Guía de Despliegue en Coolify

## Prerrequisitos

1. Tener una instancia de Coolify funcionando
2. Acceso SSH al servidor
3. Dominio configurado apuntando al servidor

## Pasos para el despliegue

### 1. Preparar el repositorio

1. Asegúrate de que todos los archivos estén commiteados en Git
2. Los archivos Docker ya están configurados:
   - `Dockerfile`
   - `docker-compose.yml`
   - `nginx.conf`
   - `default.conf`

### 2. Configurar EmailJS

Antes de desplegar, configura EmailJS siguiendo la guía en `docs/CONFIGURACION-EMAILJS.md`

### 3. En Coolify

1. **Crear nueva aplicación:**
   - Ve a tu dashboard de Coolify
   - Click en "New Resource" > "Application"
   - Selecciona tu servidor

2. **Configurar el origen:**
   - Source: Git Repository
   - Repository URL: [tu-repositorio-git]
   - Branch: main (o la rama que uses)

3. **Configuración de Build:**
   - Build Pack: Docker Compose
   - Docker Compose Location: `/docker-compose.yml`

4. **Variables de entorno:**
   No se requieren variables de entorno especiales, pero puedes agregar:
   ```
   TZ=Europe/Madrid
   ```

5. **Configuración de dominio:**
   - Domain: villarromana.com
   - También puedes agregar: www.villarromana.com

6. **SSL:**
   - Habilita "Force HTTPS"
   - Coolify generará certificados Let's Encrypt automáticamente

### 4. Desplegar

1. Click en "Deploy"
2. Espera a que el build termine
3. Verifica los logs para asegurarte de que no hay errores

### 5. Post-despliegue

1. **Verificar el sitio:**
   - Navega a https://villarromana.com
   - Prueba todas las páginas
   - Verifica que los estilos se carguen correctamente

2. **Probar funcionalidades:**
   - Formulario de contacto (con EmailJS configurado)
   - Sistema de comentarios
   - Editor de contenido (si está habilitado)

3. **Habilitar el modo admin (opcional):**
   - Abre la consola del navegador (F12)
   - Ejecuta: `contentEditorLocal.enableAdminMode()`
   - Aparecerá el botón de edición

## Mantenimiento

### Actualizar el sitio

1. Haz los cambios en tu repositorio local
2. Commit y push a Git
3. En Coolify, click en "Redeploy"

### Backups

Los datos se almacenan en localStorage del navegador:
- Comentarios
- Mensajes de contacto
- Contenido editado

Para hacer backup:
1. Abre la consola del navegador
2. Ejecuta:
   ```javascript
   // Backup de comentarios
   commentsLocalStorage.exportComments()
   
   // Backup de mensajes
   contactEmailJS.exportMessages()
   ```

### Logs

Los logs de nginx están disponibles en:
- `/var/log/nginx/access.log`
- `/var/log/nginx/error.log`

En Coolify puedes ver los logs en tiempo real desde el dashboard.

## Solución de problemas

### El sitio no carga
- Verifica los logs de nginx
- Comprueba que el puerto 80 esté expuesto
- Revisa la configuración de DNS

### Imágenes no se muestran
- Verifica que las rutas sean correctas
- Comprueba los permisos de archivos

### EmailJS no funciona
- Verifica las credenciales en `contact-emailjs.js`
- Revisa la consola del navegador
- Comprueba el dashboard de EmailJS

### Contenido no se guarda
- localStorage puede estar lleno
- Verifica permisos del navegador
- Prueba en modo incógnito

## Configuración avanzada

### Caché del navegador
El archivo `default.conf` ya está configurado con:
- Caché largo para assets estáticos (1 año)
- Sin caché para HTML
- Compresión gzip habilitada

### Seguridad
Headers de seguridad configurados:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### Performance
- Gzip habilitado
- Keep-alive configurado
- Worker processes automáticos

## Monitoreo

### Health check
Endpoint disponible en: `/health`

Puedes configurar servicios de monitoreo para verificar:
```bash
curl -f https://villarromana.com/health
```

### Métricas
Coolify proporciona métricas básicas:
- CPU usage
- Memory usage
- Network I/O
- Disk usage