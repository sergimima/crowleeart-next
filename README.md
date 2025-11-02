# CrowleeART - Next.js 15.5

Plataforma de servicios profesionales migrada a Next.js 15.5

## Estado de Migración

✅ **Fase 0**: Preparación (COMPLETADA)
✅ **Fase 1**: Setup Next.js (COMPLETADA)
⬜ **Fase 2**: Autenticación NextAuth v5
⬜ **Fase 3**: Landing Pages
⬜ **Fase 4**: Dashboard Admin
⬜ **Fase 5**: Sistema de Booking

Ver [MIGRATION_STATUS.md](../CrowleeART/MIGRATION_STATUS.md) para más detalles.

## Stack Tecnológico

- **Next.js 15.5** - Con Turbopack y React 19
- **TypeScript** - Type-safety completo
- **Prisma** - ORM para PostgreSQL
- **NextAuth v5** - Autenticación (por implementar)
- **TailwindCSS 4.0** - Estilos
- **Zod** - Validaciones
- **React Hook Form** - Formularios

## Desarrollo

### Instalar dependencias
```bash
npm install
```

### Configurar base de datos

1. Copia `.env.local.example` a `.env.local` (ya existe)
2. Configura tu `DATABASE_URL` en `.env.local`
3. Ejecuta las migraciones:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Otros comandos

```bash
# Build para producción
npm run build

# Ejecutar producción
npm start

# Lint
npm run lint

# Abrir Prisma Studio
npx prisma studio
```

## Estructura del Proyecto

```
crowleeart-next/
├── src/
│   ├── app/                    # App Router (Next.js)
│   │   ├── page.tsx           # Homepage
│   │   └── api/               # API Routes
│   │       └── health/        # Health check
│   ├── lib/                   # Librerías y utils
│   │   └── db.ts             # Prisma client
│   └── components/            # Componentes React (por crear)
├── prisma/
│   └── schema.prisma         # Database schema (8 modelos)
├── public/                   # Assets estáticos
└── .env.local               # Variables de entorno

```

## Modelos de Base de Datos

El schema incluye 8 modelos:

1. **User** - Usuarios (client, admin, professional)
2. **Service** - Servicios ofrecidos
3. **Booking** - Reservas de servicios
4. **Review** - Reseñas de usuarios
5. **Message** - Mensajes del sistema
6. **Feedback** - Feedback general
7. **Survey** - Encuestas
8. **SurveyResponse** - Respuestas a encuestas

Ver `prisma/schema.prisma` para detalles completos.

## API Routes

### Health Check
`GET /api/health` - Verifica que la API y la base de datos estén funcionando

```bash
curl http://localhost:3000/api/health
```

## Próximos Pasos

1. **Implementar NextAuth v5** - Sistema de autenticación
2. **Crear páginas de auth** - Login, Register, Logout
3. **Landing pages públicas** - Homepage, Servicios
4. **Dashboard admin** - Panel de administración
5. **Sistema de booking** - Reservas online

## Documentación

- [Plan de Migración Completo](../CrowleeART/MIGRATION_PLAN.md)
- [Estado de Migración](../CrowleeART/MIGRATION_STATUS.md)
- [Review del Proyecto Original](../CrowleeART/review.md)

## Notas

- Turbopack está activado por defecto (ready en ~1.3s)
- Next.js 15.5 usa React 19 con Server Components
- TypeScript estricto habilitado
- ESLint configurado

---

**Fecha de creación:** 18 de Octubre de 2025
**Versión de Next.js:** 15.5.6
**Progreso:** 18% (Fase 0 y 1 completadas)
