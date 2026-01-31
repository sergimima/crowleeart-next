# Mejoras sugeridas – Crowlee Art Next

Revisión del proyecto con ideas priorizadas. Puedes ir implementando por fases.

---

## Estado actual (revisión)

| # | Mejora | Estado |
|---|--------|--------|
| 1 | Unificar toasts (Sonner) | ✅ Hecho (todo usa sonner; react-toastify ya no está) |
| 2 | Proteger `/booking` en middleware | ⏭️ A propósito (reserva sin login para atraer clientes) |
| 3 | JWT_SECRET en producción | ✅ Hecho (ya cambiado en producción) |
| 4 | Metadata por página | ✅ Hecho (layout.tsx en privacy, contact, services, gallery, login) |
| 5 | next-intl o quitar selector | ⏳ Pendiente |
| 6 | Validar env al arrancar | ⏳ Pendiente |
| 7 | React Query en más sitios | ⏭️ No aplicar (ver nota); alternativa: Server Components en páginas públicas |
| 8 | ESLint en build | ⏳ Pendiente |
| 9 | Página 404 personalizada | ✅ Hecho (not-found.tsx) |
| 10 | Accesibilidad (a11y) | ✅ Hecho (labels login, aria-label/aria-expanded navbar) |

---

## Prioridad alta

### 1. Unificar notificaciones (toast): usar solo Sonner

**Problema:** Parte del código usa `react-toastify` (booking, contact, profile, AdminSurveys, AdminFeedback, AdminReviews, AdminMessages, system) y otra parte usa `sonner`. En el layout solo está el `<Toaster />` de Sonner; **no hay `<ToastContainer />` de react-toastify**, así que los toasts de react-toastify en esas páginas **no se muestran**.

**Recomendación:** Sustituir todas las llamadas `toast` de react-toastify por `toast` de `sonner` en esos archivos y, cuando no quede uso, quitar la dependencia `react-toastify`. Así todo el sitio usa un solo sistema de notificaciones y se ve consistente.

**Archivos a cambiar:**  
`src/app/booking/page.tsx`, `src/app/contact/page.tsx`, `src/app/profile/page.tsx`, `src/app/system/page.tsx`, `src/components/admin/AdminSurveys.tsx`, `AdminFeedback.tsx`, `AdminReviews.tsx`, `AdminMessages.tsx`  
→ Cambiar `import { toast } from 'react-toastify'` por `import { toast } from 'sonner'` y dejar las llamadas `toast.success()` / `toast.error()` etc. como están (la API es muy similar).

---

### 2. Proteger la ruta `/booking` en el middleware

**Problema:** `/booking` usa `ClientLayout` (área de cliente) pero **no está en el matcher del middleware**. Cualquiera puede abrir `/booking` sin estar logueado; la API de bookings ya comprueba el token, pero la página es accesible.

**Recomendación:** Si la reserva es solo para usuarios autenticados (clientes), añadir `/booking` a las rutas protegidas en `src/middleware.ts` y redirigir a login si no hay token (igual que `/dashboard` y `/profile`). Si decidís que la reserva puede ser sin login, al menos documentarlo y, si hace falta, mostrar un CTA “Log in to book” en la página.

---

### 3. JWT_SECRET en producción

**Problema:** En `src/middleware.ts` se usa:

```ts
process.env.JWT_SECRET || 'your-secret-key-change-in-production'
```

Si en producción no está definido `JWT_SECRET`, se usa ese valor por defecto (inseguro).

**Recomendación:** En producción no usar fallback: si no hay `JWT_SECRET`, que la app falle al arrancar o que el middleware rechace/redirija. Por ejemplo en middleware comprobar `process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET` y lanzar error o redirigir a una página de error, y documentar en README/CLAUDE que `JWT_SECRET` es obligatorio en producción.

---

## Prioridad media

### 4. Metadata por página (SEO)

**Problema:** Solo el layout raíz exporta `metadata`. Las páginas `/privacy`, `/contact`, `/services`, `/gallery`, `/login` no definen `title` ni `description`, así que en resultados de búsqueda y pestañas todo sale con el mismo título/descripción.

**Recomendación:** Añadir `export const metadata` (o `generateMetadata`) en cada ruta importante, por ejemplo:

- `/privacy` → title "Privacy Policy – Crowlee Art", description sobre privacidad y cookies.
- `/contact` → "Contact – Crowlee Art", descripción de contacto.
- `/services` → "Our Services – Crowlee Art", descripción de servicios.
- `/gallery` → "Gallery – Crowlee Art", descripción de la galería.
- `/login` → "Log in – Crowlee Art".

Así mejoráis SEO y experiencia en pestañas/favoritos.

---

### 5. Idioma (next-intl) o quitar el selector

**Problema:** Hay `next-intl` instalado y archivos en `public/locales/en` y `public/locales/es`, pero el cambio de idioma en la Navbar tiene un TODO: no está conectado a next-intl ni a las traducciones. El sitio se ve mayormente en inglés.

**Opciones:**

- **A)** Implementar next-intl de verdad: configurar el provider, usar `useTranslations` / `getTranslations` en las páginas y componentes clave y enlazar el selector del Navbar con el locale (cookie/URL).  
- **B)** Si de momento solo queréis inglés: quitar el selector de idioma del Navbar (o dejarlo deshabilitado con tooltip “Coming soon”) para no dar la impresión de que ya funciona.

---

### 6. Validar variables de entorno al arrancar

**Problema:** Si falta `DATABASE_URL` o `JWT_SECRET`, los fallos aparecen en tiempo de ejecución (al hacer una petición o al verificar el token).

**Recomendación:** Crear un pequeño módulo `src/lib/env.ts` que en desarrollo/producción lea las variables necesarias y, si faltan, lance un error claro al iniciar. Así el despliegue falla rápido y con un mensaje entendible.

---

## Prioridad baja / opcional

### 7. React Query en más sitios — **No aplicar por ahora**

**Contexto:** Next.js 15 con App Router ya ofrece data fetching integrado: Server Components con fetch en servidor, caché automática, `revalidatePath()` / `revalidateTag()`, Streaming y Suspense. React Query aporta valor cuando necesitas caché en cliente con invalidación manual, refetch al volver a la pestaña, polling, estados loading/error muy granulares o mutaciones optimistas.

**Recomendación:** No migrar a React Query a menos que tengas un problema concreto que resuelva mejor (p. ej. «actualizar cada 30 s» o «optimistic updates»). Los componentes actuales con `fetch` + `useState` funcionan bien y la complejidad extra no compensa ahora.

**Alternativa recomendada:** Usar **Server Components** donde sea posible en páginas públicas (`/services`, `/gallery`, etc.): es el patrón nativo de Next.js 15 y elimina la necesidad de `useEffect` + `fetch` en esas páginas.

---

### 8. ESLint en el build

**Problema:** En `next.config.ts` está `eslint: { ignoreDuringBuilds: true }`, así que el build no falla por errores de ESLint.

**Recomendación:** Cuando el equipo pueda, activar ESLint en el build (`ignoreDuringBuilds: false`) y corregir los avisos que aparezcan. Ayuda a mantener calidad y a detectar bugs antes de desplegar.

---

### 9. Página 404 personalizada

**Problema:** Next.js usa la 404 por defecto.

**Recomendación:** Añadir `src/app/not-found.tsx` con el mismo estilo que el resto (navbar, footer, mensaje tipo “Page not found” y enlace a home). Mejora la experiencia cuando alguien entra a una URL incorrecta.

---

### 10. Accesibilidad (a11y) — **Hecho**

**Cambios aplicados:** (1) **Login:** cada input tiene `<label>` asociado con `htmlFor`/`id` y clase `sr-only` (visible para lectores de pantalla, oculto visualmente para no cambiar el diseño); añadidos `autoComplete` donde aplica. (2) **Navbar:** botón menú móvil (☰) con `aria-label="Open menu"` / `"Close menu"` y `aria-expanded`; botón menú usuario con `aria-label="User menu"`, `aria-expanded` y `aria-haspopup="menu"`; anillos de foco (`focus:ring-2 focus:ring-purple-400`) en ambos botones para navegación por teclado.

---

## Resumen rápido

| Prioridad | Mejora                         | Esfuerzo aproximado |
|----------|---------------------------------|---------------------|
| Alta     | Unificar toasts (Sonner)        | Bajo                |
| Alta     | Proteger `/booking` en middleware | Bajo (no aplicar: a propósito) |
| Alta     | JWT_SECRET sin fallback en prod | Bajo                |
| Media    | Metadata por página             | Bajo                |
| Media    | next-intl o quitar selector     | Medio / Bajo        |
| Media    | Validar env al arrancar         | Bajo                |
| Baja     | Más uso de React Query          | No aplicar; alternativa: Server Components en /services, /gallery |
| Baja     | ESLint en build                 | Bajo (tras arreglar avisos) |
| Baja     | not-found.tsx                   | Bajo                |
| Baja     | Revisión a11y                   | Hecho               |

Si quieres, el siguiente paso puede ser implementar solo las de prioridad alta (toasts, protección de `/booking` y JWT en producción) en el repo.
