#!/bin/bash

# Script para iniciar el servidor web local
# Esto evitará los problemas de bloqueo al abrir el archivo directamente

echo "Iniciando servidor web local para Villarromana..."
echo ""
echo "El servidor se iniciará en http://localhost:8000"
echo ""
echo "Para detener el servidor, presiona Ctrl+C"
echo ""

# Cambiar al directorio del proyecto
cd "$(dirname "$0")"

# Iniciar el servidor Python
python3 -m http.server 8000

# Si Python 3 no está disponible, intentar con Python 2
if [ $? -ne 0 ]; then
    echo "Python 3 no encontrado, intentando con Python 2..."
    python -m SimpleHTTPServer 8000
fi