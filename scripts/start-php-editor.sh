#!/bin/bash

# Script para iniciar el editor PHP de Villarromana
# Este script facilita el inicio del sistema de edición con Docker

echo "============================================"
echo "  Iniciando Editor PHP de Villarromana"
echo "============================================"
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "Por favor, instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar si Docker está ejecutándose
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker no está ejecutándose"
    echo "Por favor, inicia Docker Desktop"
    exit 1
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p content content/backups img/uploads logs

# Establecer permisos
echo "🔐 Configurando permisos..."
chmod -R 777 content img/uploads logs

# Detener contenedores anteriores si existen
echo "🛑 Deteniendo contenedores anteriores..."
docker-compose -f docker-compose.php.yml down 2>/dev/null || true

# Construir la imagen
echo "🔨 Construyendo imagen Docker..."
docker-compose -f docker-compose.php.yml build

# Iniciar el contenedor
echo "🚀 Iniciando contenedor..."
docker-compose -f docker-compose.php.yml up -d

# Esperar a que el servicio esté listo
echo "⏳ Esperando a que el servicio esté listo..."
sleep 5

# Verificar si el servicio está funcionando
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|301\|302"; then
    echo ""
    echo "✅ ¡Editor PHP iniciado correctamente!"
    echo ""
    echo "🌐 Accede al editor en: http://localhost:8080"
    echo ""
    echo "🔐 Credenciales de acceso:"
    echo "   Usuario: admin"
    echo "   Contraseña: metadrop2024"
    echo ""
    echo "📝 Para ver los logs:"
    echo "   docker-compose -f docker-compose.php.yml logs -f"
    echo ""
    echo "🛑 Para detener el editor:"
    echo "   docker-compose -f docker-compose.php.yml down"
    echo ""
else
    echo ""
    echo "❌ Error: El servicio no responde correctamente"
    echo "Revisa los logs con: docker-compose -f docker-compose.php.yml logs"
    exit 1
fi