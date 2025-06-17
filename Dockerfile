# Dockerfile para servir el sitio estático de Hotel Rural Villarromana
FROM nginx:alpine

# Instalar herramientas útiles
RUN apk add --no-cache \
    curl \
    vim \
    tzdata

# Establecer zona horaria
ENV TZ=Europe/Madrid
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Crear directorios necesarios
RUN mkdir -p /usr/share/nginx/html/logs

# Copiar archivos del sitio web
COPY . /usr/share/nginx/html/

# Establecer permisos correctos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 777 /usr/share/nginx/html/logs

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]