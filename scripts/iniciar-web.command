#!/bin/bash

# Script para iniciar el servidor web de Villarromana
cd "$(dirname "$0")"

clear
echo "================================================"
echo "        🏚️  VILLARROMANA WEB SERVER"
echo "================================================"
echo ""

# Verificar PHP
if ! command -v php &> /dev/null; then
    echo "❌ ERROR: PHP no está instalado"
    echo ""
    echo "Para instalar PHP en Mac:"
    echo "1. Abre otra Terminal"
    echo "2. Ejecuta: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "3. Luego ejecuta: brew install php"
    echo ""
    read -p "Presiona Enter para salir..."
    exit 1
fi

echo "✅ PHP está instalado"
echo ""

# Crear directorios necesarios
echo "📁 Preparando directorios..."
mkdir -p img php/data 2>/dev/null
chmod 777 img php/data 2>/dev/null

# Información del servidor
echo ""
echo "🌐 INFORMACIÓN DEL SERVIDOR:"
echo "================================"
echo "URL Principal:    http://localhost:8080"
echo "Página de Inicio: http://localhost:8080/inicio.html"
echo "================================"
echo ""
echo "🔐 CREDENCIALES DEL EDITOR:"
echo "Usuario:    admin"
echo "Contraseña: metadrop2024"
echo "================================"
echo ""
echo "📝 INSTRUCCIONES:"
echo "1. Espera 3 segundos..."
echo "2. Se abrirá tu navegador automáticamente"
echo "3. Si no se abre, copia y pega en tu navegador:"
echo "   http://localhost:8080/inicio.html"
echo ""
echo "Para detener el servidor: Presiona Control+C"
echo "================================"
echo ""

# Esperar un momento
sleep 3

# Abrir navegador
echo "🌐 Abriendo navegador..."
open http://localhost:8080/inicio.html

echo ""
echo "🚀 Servidor iniciado en puerto 8080"
echo ""

# Iniciar servidor PHP en puerto 8080
php -S localhost:8080