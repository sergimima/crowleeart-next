# 🚀 Guía de Deployment - CrowleeART (Next.js)

Esta guía te ayudará a configurar tu aplicación CrowleeART Next.js en un servidor de producción con soporte para múltiples dominios.

## 📋 Requisitos Previos

### En tu servidor:
- **Ubuntu/Debian 20.04+** o **CentOS/RHEL 8+**
- **Docker** y **Docker Compose** instalados
- **Puertos abiertos**: 80 (HTTP), 443 (HTTPS)
- **Dominios configurados**: crowleeart.com y crowleeart.co.uk apuntando al servidor
- **Mínimo 2GB RAM**, 2 CPU cores recomendado

### Instalación de Docker (Ubuntu/Debian):
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Reiniciar sesión para aplicar cambios de grupo
exit
```

## 🔧 Configuración Inicial

### 1. Clonar el proyecto en el servidor
```bash
git clone https://github.com/tu-usuario/crowleeart-next.git
cd crowleeart-next
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.production.example .env.production

# Editar con tus valores reales
nano .env.production
```

**⚠️ IMPORTANTE**: Genera secretos seguros:
```bash
# JWT_SECRET
openssl rand -base64 32

# NEXTAUTH_SECRET
openssl rand -base64 32

# Contraseña PostgreSQL
openssl rand -base64 24
```

### 3. Configurar DNS
Asegúrate de que tus dominios apunten al servidor:
```bash
# Verificar DNS
dig +short crowleeart.com
dig +short crowleeart.co.uk
```

### 4. Actualizar next.config.js para producción
Verifica que `next.config.js` tenga la configuración correcta:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // IMPORTANTE para Docker
  // ... resto de config
}
```

## 🚀 Deployment

### Opción 1: Deployment Automático (Recomendado)
```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Ejecutar deployment
./deploy.sh

# Para limpiar imágenes antiguas
./deploy.sh --clean
```

### Opción 2: Deployment Manual
```bash
# Parar servicios existentes
docker compose -f docker-compose.prod.yml --env-file .env.production down

# Construir imágenes
docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache

# Iniciar servicios
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Ejecutar migraciones de Prisma
docker compose -f docker-compose.prod.yml --env-file .env.production exec app npx prisma migrate deploy

# Verificar estado
docker compose -f docker-compose.prod.yml ps
```

## 🔒 Configuración SSL (HTTPS)

### Obtener certificados SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot -y

# Detener nginx temporalmente
docker compose -f docker-compose.prod.yml stop nginx

# Obtener certificados para crowleeart.com
sudo certbot certonly --standalone \
  --email tu-email@crowleeart.com \
  --agree-tos \
  -d crowleeart.com \
  -d www.crowleeart.com

# Obtener certificados para crowleeart.co.uk
sudo certbot certonly --standalone \
  --email tu-email@crowleeart.com \
  --agree-tos \
  -d crowleeart.co.uk \
  -d www.crowleeart.co.uk

# Crear directorios para certificados
mkdir -p nginx/ssl/crowleeart.com
mkdir -p nginx/ssl/crowleeart.co.uk

# Copiar certificados
sudo cp /etc/letsencrypt/live/crowleeart.com/* nginx/ssl/crowleeart.com/
sudo cp /etc/letsencrypt/live/crowleeart.co.uk/* nginx/ssl/crowleeart.co.uk/

# Reiniciar nginx
docker compose -f docker-compose.prod.yml start nginx
```

### Renovación automática de certificados
```bash
# Agregar cron job para renovación automática
sudo crontab -e

# Agregar esta línea (se ejecuta diariamente a las 2am):
0 2 * * * certbot renew --quiet && docker compose -f /path/to/crowleeart-next/docker-compose.prod.yml restart nginx
```

## 🔍 Verificación

### Verificar servicios
```bash
# Estado de contenedores
docker compose -f docker-compose.prod.yml ps

# Logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Logs de un servicio específico
docker compose -f docker-compose.prod.yml logs app
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml logs nginx

# Health checks
curl http://localhost/health
curl https://crowleeart.com/health
curl https://crowleeart.co.uk/health
```

### Verificar base de datos
```bash
# Acceder a PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U crowlee -d crowleeart

# Ver tablas
\dt

# Salir
\q
```

## 🛠️ Comandos Útiles

### Gestión de servicios
```bash
# Parar todos los servicios
docker compose -f docker-compose.prod.yml down

# Reiniciar un servicio específico
docker compose -f docker-compose.prod.yml restart app

# Ver logs de un servicio
docker compose -f docker-compose.prod.yml logs app

# Acceder a un contenedor
docker compose -f docker-compose.prod.yml exec app sh
```

### Backup de base de datos
```bash
# Crear backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U crowlee crowleeart > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose -f docker-compose.prod.yml exec -T postgres psql -U crowlee crowleeart < backup.sql
```

### Prisma
```bash
# Ver esquema actual
docker compose -f docker-compose.prod.yml exec app npx prisma db pull

# Generar cliente
docker compose -f docker-compose.prod.yml exec app npx prisma generate

# Ejecutar migraciones
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Abrir Prisma Studio (⚠️ solo en desarrollo)
# docker compose -f docker-compose.prod.yml exec app npx prisma studio
```

### Monitoreo
```bash
# Uso de recursos
docker stats

# Espacio en disco
docker system df

# Limpiar recursos no utilizados
docker system prune -f
```

## 🔄 Actualizaciones

### Actualizar aplicación
```bash
# Obtener últimos cambios
git pull origin main

# Reconstruir y reiniciar
docker compose -f docker-compose.prod.yml build --no-cache app
docker compose -f docker-compose.prod.yml up -d app

# O usar el script de deploy
./deploy.sh
```

## 🚨 Troubleshooting

### Problemas comunes

**Error de conexión a base de datos:**
```bash
# Verificar que PostgreSQL esté corriendo
docker compose -f docker-compose.prod.yml logs postgres

# Verificar variables de entorno
docker compose -f docker-compose.prod.yml config

# Verificar DATABASE_URL
docker compose -f docker-compose.prod.yml exec app env | grep DATABASE
```

**Error 502 Bad Gateway:**
```bash
# Verificar que la app esté corriendo
docker compose -f docker-compose.prod.yml logs app

# Verificar conectividad interna
docker compose -f docker-compose.prod.yml exec nginx wget -O- http://app:3000/health
```

**Problemas con SSL:**
```bash
# Verificar certificados
sudo certbot certificates

# Verificar configuración nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Verificar logs de nginx
docker compose -f docker-compose.prod.yml logs nginx
```

**App no arranca (OOM - Out of Memory):**
```bash
# Verificar memoria disponible
free -h

# Ver límites de Docker
docker stats

# Aumentar memoria swap si es necesario
sudo dd if=/dev/zero of=/swapfile bs=1G count=2
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🔐 Seguridad

### Configurar firewall básico:
```bash
# Instalar UFW
sudo apt install ufw -y

# Configurar reglas básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Activar firewall
sudo ufw enable
```

### Recomendaciones adicionales:
1. **Fail2ban**: Protección contra ataques de fuerza bruta
2. **Backups automáticos**: Configurar backups diarios de la base de datos
3. **Monitoreo**: Configurar alertas (Uptime Robot, Pingdom, etc.)
4. **Updates**: Mantener sistema y Docker actualizados
5. **Secrets**: Rotar JWT_SECRET y contraseñas periódicamente

## 📞 Checklist Post-Deployment

- [ ] DNS apunta al servidor
- [ ] Certificados SSL configurados y funcionando
- [ ] Base de datos corriendo y migraciones ejecutadas
- [ ] App responde en https://crowleeart.com
- [ ] App responde en https://crowleeart.co.uk
- [ ] /health endpoint responde OK
- [ ] Login funciona correctamente
- [ ] Uploads de archivos funcionan
- [ ] Backups automáticos configurados
- [ ] Monitoreo configurado
- [ ] Firewall configurado

---

**¡Tu aplicación CrowleeART está lista para producción! 🎉**
