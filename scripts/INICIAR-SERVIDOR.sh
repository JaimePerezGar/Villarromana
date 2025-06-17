#!/bin/bash

# Cambiar al directorio del script
cd "$(dirname "$0")"

# Limpiar pantalla
clear

echo "🏚️  INICIANDO SERVIDOR VILLARROMANA..."
echo ""

# Intentar con puerto 8080
PORT=8080

# Si 8080 está ocupado, buscar otro puerto
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    echo "⚠️  Puerto $PORT ocupado, probando siguiente..."
    PORT=$((PORT + 1))
done

echo "✅ Usando puerto: $PORT"
echo ""
echo "======================================"
echo "🌐 ABRE TU NAVEGADOR Y VE A:"
echo ""
echo "   http://localhost:$PORT"
echo ""
echo "======================================"
echo ""
echo "Usuario: admin"
echo "Contraseña: metadrop2024"
echo ""
echo "Presiona Ctrl+C para detener"
echo "======================================"

# Abrir navegador automáticamente después de 2 segundos
(sleep 2 && open "http://localhost:$PORT/inicio.html") &

# Iniciar servidor
php -S localhost:$PORT