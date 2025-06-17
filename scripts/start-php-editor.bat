@echo off
REM Script para iniciar el editor PHP de Villarromana en Windows

echo ============================================
echo   Iniciando Editor PHP de Villarromana
echo ============================================
echo.

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker no esta instalado
    echo Por favor, instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar si Docker está ejecutándose
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker no esta ejecutandose
    echo Por favor, inicia Docker Desktop
    pause
    exit /b 1
)

REM Crear directorios necesarios
echo Creando directorios necesarios...
if not exist "content" mkdir content
if not exist "content\backups" mkdir content\backups
if not exist "img\uploads" mkdir img\uploads
if not exist "logs" mkdir logs

REM Detener contenedores anteriores si existen
echo Deteniendo contenedores anteriores...
docker-compose -f docker-compose.php.yml down >nul 2>&1

REM Construir la imagen
echo Construyendo imagen Docker...
docker-compose -f docker-compose.php.yml build

REM Iniciar el contenedor
echo Iniciando contenedor...
docker-compose -f docker-compose.php.yml up -d

REM Esperar a que el servicio esté listo
echo Esperando a que el servicio este listo...
timeout /t 5 /nobreak >nul

REM Mensaje final
echo.
echo Editor PHP iniciado correctamente!
echo.
echo Accede al editor en: http://localhost:8080
echo.
echo Credenciales de acceso:
echo    Usuario: admin
echo    Password: metadrop2024
echo.
echo Para ver los logs:
echo    docker-compose -f docker-compose.php.yml logs -f
echo.
echo Para detener el editor:
echo    docker-compose -f docker-compose.php.yml down
echo.
pause