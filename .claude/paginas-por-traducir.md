# Páginas por traducir (next-intl)

Resumen de qué usa ya traducciones y qué sigue con texto fijo.

---

## ✅ Ya traducidas (usan `useTranslations` / `getTranslations`)

| Página/componente | Namespace | Estado |
|-------------------|-----------|--------|
| **Navbar** | `navbar` | Completo (enlaces, login, menú usuario, idioma) |
| **Footer** | `footer` | Completo (copyright, enlace privacidad) |
| **Home** | `home` | Parcial: título, tagline, heroDescription, benefits |

---

## ✅ Prioridad alta – Hechas

- **Contact** – `useTranslations('contact')`, labels, toasts, reachUs.
- **Services** – `useTranslations('services')`, title, description, loading, noServices, finalTitle/finalText.
- **Gallery** – `useTranslations('gallery')`, title, subtitle, loading, filter, CTA, featured, noItems.
- **Booking** – `useTranslations('booking')`, título, labels, placeholders, toasts/errores, refImage, note.
- **Login** – `useTranslations('login')`, título, placeholders, botones, toasts (validación + invitación), validating/registeringAs.

---

## ⏳ Faltan por traducir

### 1. **Home (`src/app/page.tsx`)** – Parcial

**Ya traducido:** título, tagline, heroDescription, benefits.

**Sigue en inglés fijo:**
- Sección "Our Services": título, "Professional maintenance services...", "Loading services...", "View All Services"
- Sección "Why Choose Us": título, "Professional expertise..."
- Sección galería/CTA: "Work Gallery and Testimonials", "Discover real projects...", "Explore Our Work"
- Cualquier otro texto visible en la home

**Claves en messages:** `home` (añadir si falta: `servicesSectionTitle`, `viewAllServices`, `loadingServices`, `whyChooseUs`, etc.).

---

### 2. **Contact (`src/app/contact/page.tsx`)**

**Texto fijo:** título "Contact Us", labels (Name, Email, Subject, Message), placeholder, botón "Send Message" / "Sending...", toasts de error/éxito, líneas de email/teléfono al final.

**Claves en messages:** Ya existen en `contact.*` (title, name, email, subject, message, placeholder, submit, alertInvalidEmail, alertSuccess). Solo falta usar `useTranslations('contact')` y sustituir los strings.

---

### 3. **Services (`src/app/services/page.tsx`)**

**Texto fijo:** "Our Services", descripción larga, "Loading services...", y los textos de cada bloque de servicio (doorTitle, doorText, etc.) si se muestran en la página.

**Claves en messages:** `services.*` ya tiene title, description y todos los títulos/textos. Falta conectar la página con `useTranslations('services')`.

---

### 4. **Gallery (`src/app/gallery/page.tsx`)**

**Texto fijo:** "Our Work Gallery" o similar, "Loading gallery...", filtros (All, etc.), CTA (título, descripción, "Book Now").

**Claves en messages:** `gallery.*` (title, category.all, cta, etc.). Falta usar `useTranslations('gallery')` y sustituir textos.

---

### 5. **Booking (`src/app/booking/page.tsx`)**

**Texto fijo:** título, labels (Phone, Service, Date, Description), "Select a Service", placeholders, toasts de validación/éxito/error, "Book Service", mensajes de error (imagen, campos obligatorios, fecha futura, etc.).

**Claves en messages:** `booking.*` ya tiene title, name, phone, service, selectService, date, description, submit, etc. Falta conectar con `useTranslations('booking')` y añadir claves para toasts/errores si no están.

---

### 6. **Login (`src/app/login/page.tsx`)**

**Texto fijo:** "Login" / "Create Account", placeholders (Name, Email, Password, etc.), "Processing..." / "Register" / "Login", "Already have an account?" / "Don't have an account?", hint de contraseña, "Validating invitation...", "You are registering as:".

**Claves en messages:** `login.*` (title, createAccount, name, email, password, submit, noAccount, haveAccount, passwordHint). Falta usar `useTranslations('login')` y añadir claves para invitación/validating si se quieren traducir.

---

### 7. **Not-found (`src/app/not-found.tsx`)**

**Texto fijo:** "404", "Page not found", descripción, "Back to home".

**Claves en messages:** Ya existen `notFound.title`, `notFound.subtitle`, `notFound.description`, `notFound.backHome`. Falta usar `getTranslations('notFound')` en el componente (es Server Component, así que `getTranslations` desde `next-intl/server`).

---

### 8. **Cookie consent (`src/components/CookieConsent.tsx`)**

**Texto fijo:** Todo en español ("Utilizamos cookies", "Solo necesarias", "Aceptar todas", "Política de cookies", párrafo largo). Debería respetar el idioma elegido (en/es).

**Acción:** Añadir namespace `cookies` en `messages/en.json` y `messages/es.json` y usar `useTranslations('cookies')` en el componente.

---

### 9. **Privacy (`src/app/privacy/page.tsx`)**

**Texto fijo:** Todo el contenido está en inglés (título "Privacy Policy", "Last updated", secciones 1–6). Es mucho texto.

**Opciones:**  
- A) Añadir namespace `privacy` en messages con todas las secciones en EN y ES y usar `useTranslations('privacy')`.  
- B) Dejar la página solo en inglés de momento (es legal/SEO y a veces se mantiene en un idioma).

---

### 10. **Dashboard cliente (`src/app/dashboard/client/page.tsx`)**

**Texto fijo:** "My Bookings", "Loading...", estados (Pending, Confirmed, Completed, Cancelled), botones, mensajes vacíos, etc.

**Claves en messages:** En `public/locales/es/common.json` hay `clientDashboard`; en `messages/` habría que añadir `clientDashboard` (o equivalente) en en.json y es.json y usar `useTranslations('clientDashboard')` en la página.

---

### 11. **Dashboard admin / worker / profile**

Prioridad más baja (área interna). Se pueden traducir más adelante si interesa.

---

## Resumen rápido

| Prioridad | Página/componente     | Esfuerzo   | Claves en messages      |
|----------|------------------------|------------|--------------------------|
| Alta     | Contact                | Bajo       | Sí (`contact`)          |
| Alta     | Services               | Bajo       | Sí (`services`)         |
| Alta     | Gallery                | Bajo       | Sí (`gallery`)          |
| Alta     | Booking                | Medio      | Sí (`booking`)          |
| Alta     | Login                  | Medio      | Sí (`login`)            |
| Media    | Home (resto secciones) | Bajo       | Añadir/ajustar en `home`|
| Media    | Not-found              | Bajo       | Sí (`notFound`)         |
| Media    | Cookie consent         | Bajo       | Añadir `cookies`        |
| Baja     | Privacy                | Alto       | Añadir `privacy` o dejar EN |
| Baja     | Dashboard client       | Medio      | Añadir `clientDashboard`|
| Baja     | Admin / worker / profile | Opcional | —                     |

Si quieres, el siguiente paso puede ser implementar las de prioridad alta (Contact, Services, Gallery, Booking, Login) y not-found + cookie consent, en ese orden.
