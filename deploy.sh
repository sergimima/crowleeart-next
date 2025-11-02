#!/bin/bash
# =============================
# 🚀 SCRIPT DE DEPLOYMENT - CROWLEE ART (Next.js)
# =============================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    error "No se encuentra docker-compose.prod.yml. Ejecuta desde el directorio raíz del proyecto."
fi

# Verificar que existe .env.production
if [ ! -f ".env.production" ]; then
    error "No se encuentra .env.production. Copia y configura el archivo .env.production"
fi

log "🚀 Iniciando deployment de CrowleeART (Next.js)..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
fi

if ! docker compose version &> /dev/null; then
    error "Docker Compose no está instalado"
fi

# Parar servicios existentes si están corriendo
log "🛑 Parando servicios existentes..."
docker compose -f docker-compose.prod.yml --env-file .env.production down || true

# Limpiar imágenes antiguas (opcional)
if [ "$1" = "--clean" ]; then
    log "🧹 Limpiando imágenes antiguas..."
    docker system prune -f
    docker image prune -f
fi

# Construir imágenes
log "🔨 Construyendo imágenes..."
docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache

# Iniciar base de datos primero
log "🗃️ Iniciando PostgreSQL..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres

# Esperar a que PostgreSQL esté listo
log "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Ejecutar migraciones de Prisma
log "📊 Ejecutando migraciones de base de datos..."
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm app npx prisma migrate deploy || warn "No se pudieron ejecutar migraciones automáticamente"

# Iniciar todos los servicios
log "🚀 Iniciando todos los servicios..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Esperar a que los servicios estén listos
log "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
log "🔍 Verificando estado de los servicios..."
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# Verificar logs de errores
log "📋 Verificando logs recientes..."
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=20

# Verificar conectividad
log "🌐 Verificando conectividad..."
if curl -f http://localhost/health &> /dev/null; then
    log "✅ Aplicación funcionando correctamente!"
else
    warn "⚠️  La aplicación puede no estar respondiendo correctamente"
fi

log "🎉 Deployment completado!"
log "📝 Para ver logs en tiempo real: docker compose -f docker-compose.prod.yml logs -f"
log "🛑 Para parar: docker compose -f docker-compose.prod.yml down"

# Mostrar información útil
echo ""
echo -e "${BLUE}=== INFORMACIÓN DEL DEPLOYMENT ===${NC}"
echo -e "${BLUE}Aplicación:${NC} http://localhost"
echo -e "${BLUE}Health Check:${NC} http://localhost/health"
echo -e "${BLUE}API:${NC} http://localhost/api"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "${YELLOW}- Configura los certificados SSL para HTTPS${NC}"
echo -e "${YELLOW}- Actualiza los DNS para apuntar a este servidor${NC}"
echo -e "${YELLOW}- Cambia las contraseñas por defecto en .env.production${NC}"
echo -e "${YELLOW}- Verifica que las migraciones de Prisma se ejecutaron correctamente${NC}"
