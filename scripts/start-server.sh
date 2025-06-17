#!/bin/bash

echo "🚀 Iniciando servidor para Villarromana..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar PHP
if ! command -v php &> /dev/null; then
    echo "❌ PHP no está instalado. Instálalo primero:"
    echo "   Mac: brew install php"
    echo "   Linux: sudo apt-get install php"
    exit 1
fi

# Matar cualquier proceso en el puerto 8000
if lsof -i :8000 &> /dev/null; then
    echo "⚠️  Deteniendo servidor anterior en puerto 8000..."
    kill $(lsof -t -i:8000) 2>/dev/null
    sleep 1
fi

# Crear directorios necesarios si no existen
echo "📁 Verificando directorios..."
mkdir -p img php/data
chmod 777 img php/data

echo ""
echo -e "${GREEN}✅ Sistema listo!${NC}"
echo ""
echo -e "${BLUE}📋 Información del servidor:${NC}"
echo "   URL Principal: http://localhost:8000"
echo "   Diagnóstico: http://localhost:8000/test-upload-diagnostic.php"
echo ""
echo -e "${YELLOW}🔐 Credenciales del editor:${NC}"
echo "   Usuario: admin"
echo "   Contraseña: metadrop2024"
echo ""
echo "🌐 Abriendo navegador en 3 segundos..."
echo ""

# Esperar 3 segundos antes de abrir el navegador
sleep 3

# Abrir el navegador según el sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:8000" &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:8000" &
    elif command -v gnome-open &> /dev/null; then
        gnome-open "http://localhost:8000" &
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start "http://localhost:8000" &
fi

# Iniciar servidor PHP
echo -e "${GREEN}🚀 Servidor iniciado. Presiona Ctrl+C para detener.${NC}"
echo ""
php -S localhost:8000