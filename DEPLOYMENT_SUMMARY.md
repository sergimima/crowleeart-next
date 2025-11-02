# 📦 Resumen de Archivos de Deployment

## ✅ Archivos Creados

### Docker & Deployment
1. **`Dockerfile`** - Multi-stage build para Next.js optimizado
2. **`docker-compose.prod.yml`** - Configuración para PostgreSQL, Next.js App y Nginx
3. **`.dockerignore`** - Excluir archivos innecesarios del build

### Nginx
4. **`nginx/nginx.conf`** - Configuración principal de Nginx
5. **`nginx/conf.d/crowleeart.conf`** - Configuración específica con SSL y rate limiting

### Scripts & Config
6. **`deploy.sh`** - Script automatizado de deployment
7. **`.env.production.example`** - Template de variables de entorno
8. **`DEPLOYMENT.md`** - Guía completa de deployment

### Actualizaciones
9. **`next.config.ts`** - Actualizado con `output: 'standalone'` para Docker

---

## 🔑 Diferencias vs Proyecto Viejo

### Proyecto Viejo (React + Express)
- Frontend separado (React)
- Backend separado (Express en puerto 4000)
- Redis para cache
- 2 servicios Docker diferentes

### Proyecto Nuevo (Next.js 15)
- **Todo en uno**: Frontend + Backend API integrado
- **Un solo servicio**: Next.js App en puerto 3000
- **Sin Redis**: No es necesario por ahora
- **Más simple**: Menos contenedores, más fácil de mantener

---

## 🚀 Pasos para Deployar

### 1. En tu servidor
```bash
# Clonar proyecto
git clone https://github.com/tu-usuario/crowleeart-next.git
cd crowleeart-next
```

### 2. Configurar variables de entorno
```bash
# Copiar template
cp .env.production.example .env.production

# Editar con tus valores
nano .env.production

# Generar secrets
openssl rand -base64 32  # Para JWT_SECRET
openssl rand -base64 32  # Para NEXTAUTH_SECRET
```

### 3. Deployar
```bash
# Hacer ejecutable
chmod +x deploy.sh

# Ejecutar
./deploy.sh
```

### 4. Configurar SSL
```bash
# Instalar Certbot
sudo apt install certbot -y

# Obtener certificados
sudo certbot certonly --standalone -d crowleeart.com -d www.crowleeart.com
sudo certbot certonly --standalone -d crowleeart.co.uk -d www.crowleeart.co.uk

# Copiar a nginx
mkdir -p nginx/ssl/crowleeart.com
mkdir -p nginx/ssl/crowleeart.co.uk
sudo cp /etc/letsencrypt/live/crowleeart.com/* nginx/ssl/crowleeart.com/
sudo cp /etc/letsencrypt/live/crowleeart.co.uk/* nginx/ssl/crowleeart.co.uk/

# Reiniciar nginx
docker compose -f docker-compose.prod.yml restart nginx
```

---

## ⚙️ Servicios Docker

### `postgres` (PostgreSQL 15)
- **Puerto interno**: 5432
- **Usuario**: crowlee (configurable en .env.production)
- **Base de datos**: crowleeart
- **Volumen**: `postgres_data` (datos persistentes)

### `app` (Next.js)
- **Puerto interno**: 3000
- **Contiene**: Frontend + API Routes
- **Volumen**: `uploads_data` (archivos subidos)
- **Health check**: `/api/health`

### `nginx` (Reverse Proxy)
- **Puertos externos**: 80, 443
- **SSL**: Soporta múltiples dominios
- **Rate limiting**: 10 req/s general, 1 req/s login
- **Cache**: Static files con max-age

---

## 📊 Arquitectura

```
Internet
    ↓
Nginx (puerto 80/443)
    ├─ SSL/TLS termination
    ├─ Rate limiting
    ├─ Gzip compression
    └─ Proxy pass ↓
         Next.js App (puerto 3000)
            ├─ Frontend (SSR/SSG)
            ├─ API Routes (/api/*)
            └─ Database ↓
                 PostgreSQL (puerto 5432)
```

---

## 🔐 Variables de Entorno Importantes

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://user:pass@postgres:5432/db` |
| `JWT_SECRET` | Secret para tokens JWT | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL de producción | `https://crowleeart.com` |
| `NEXTAUTH_SECRET` | Secret para NextAuth | `openssl rand -base64 32` |

---

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Reiniciar app
docker compose -f docker-compose.prod.yml restart app

# Backup base de datos
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U crowlee crowleeart > backup.sql

# Acceder a la app
docker compose -f docker-compose.prod.yml exec app sh

# Ver estado de servicios
docker compose -f docker-compose.prod.yml ps

# Parar todo
docker compose -f docker-compose.prod.yml down
```

---

## ✅ Checklist Pre-Deployment

- [ ] DNS configurado apuntando al servidor
- [ ] Docker y Docker Compose instalados
- [ ] .env.production creado con valores reales
- [ ] Secrets generados (JWT_SECRET, NEXTAUTH_SECRET)
- [ ] Contraseña PostgreSQL segura
- [ ] Puerto 80 y 443 abiertos en firewall
- [ ] Certificados SSL listos (o Certbot instalado)

## ✅ Checklist Post-Deployment

- [ ] App responde en http://tu-servidor
- [ ] Health check responde: http://tu-servidor/health
- [ ] SSL funciona: https://crowleeart.com
- [ ] Login funciona correctamente
- [ ] Uploads funcionan
- [ ] Base de datos tiene datos (migraciones ejecutadas)

---

## 🆘 Soporte

Si algo falla:
1. Ver logs: `docker compose -f docker-compose.prod.yml logs`
2. Verificar health checks: `curl http://localhost/health`
3. Revisar [DEPLOYMENT.md](DEPLOYMENT.md) para troubleshooting
4. Verificar .env.production tiene todos los valores

---

**Todo listo para deployar! 🚀**
