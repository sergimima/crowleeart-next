# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CrowleeART is a professional services booking platform built with Next.js 15.5, migrated from a previous implementation. The platform provides booking services, user management, gallery, and admin dashboard functionality for a tattoo/piercing/maintenance business.

**Current Migration Status:** Phase 0-1 completed (18% overall progress)

## Essential Commands

### Development
```bash
npm run dev              # Start dev server with Turbopack (~1.3s ready)
npm run build            # Production build
npm start                # Start production server
npm run lint             # Run ESLint
```

### Database (Prisma)
```bash
npx prisma migrate dev --name <migration-name>  # Create and apply migration
npx prisma generate                              # Generate Prisma Client
npx prisma studio                                # Open Prisma Studio GUI
npx prisma db seed                               # Seed database with test data
npx prisma db push                               # Push schema without migrations (dev only)
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d    # Start production stack
docker-compose -f docker-compose.prod.yml down     # Stop production stack
docker-compose -f docker-compose.prod.yml logs -f  # View logs
```

## Architecture

### Tech Stack
- **Next.js 15.5** with React 19, App Router, and Turbopack
- **TypeScript** with strict mode enabled
- **Prisma ORM** with PostgreSQL database
- **JWT Authentication** (custom implementation, not NextAuth yet)
- **TailwindCSS 4.0** for styling with Radix UI components
- **Zod** for schema validation
- **React Hook Form** for form handling
- **React Query** (@tanstack/react-query) for data fetching
- **Sonner** for toast notifications (unified across all components)

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Homepage
│   ├── login/                   # Login page
│   ├── services/                # Services listing
│   ├── gallery/                 # Gallery page
│   ├── contact/                 # Contact page
│   ├── booking/                 # Booking page (protected)
│   ├── profile/                 # User profile (protected)
│   ├── dashboard/
│   │   ├── admin/              # Admin dashboard (role: admin)
│   │   ├── client/             # Client dashboard (role: client)
│   │   └── worker/             # Worker dashboard (role: worker) - Time tracking
│   └── api/                     # API Routes
│       ├── auth/               # Authentication endpoints
│       │   ├── login/
│       │   ├── register/
│       │   ├── logout/
│       │   └── me/
│       ├── admin/              # Admin-only endpoints
│       │   ├── services/
│       │   ├── users/
│       │   ├── bookings/
│       │   ├── gallery/
│       │   ├── qrcodes/
│       │   ├── timelogs/       # Time log management
│       │   ├── invitations/    # Invitation link management
│       │   └── full-data/      # Export all data
│       ├── invitations/        # Public invitation validation
│       │   └── validate/       # Validate invitation token
│       ├── timelogs/           # Worker time tracking endpoints
│       │   ├── active/         # Get active session
│       │   └── [id]/           # Clock out
│       ├── user/               # User profile endpoints
│       ├── bookings/           # Booking management
│       ├── services/           # Service listing
│       ├── gallery/            # Gallery items
│       ├── upload/             # File upload
│       ├── track/              # QR code tracking
│       └── health/             # Health check
├── components/
│   ├── ui/                     # Radix UI components (shadcn/ui style)
│   ├── admin/                  # Admin dashboard components
│   │   ├── AdminTimeLogs.tsx   # Time log management with editing
│   │   └── AdminInvitations.tsx # Invitation link management
│   ├── Navbar.tsx              # Main navigation
│   ├── Footer.tsx
│   ├── ClientLayout.tsx
│   ├── ClientProviders.tsx     # React Query provider wrapper
│   ├── WhatsAppWidget.tsx
│   ├── CheckatradeWidget.tsx
│   └── QRTracker.tsx
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # JWT verification utilities
│   ├── security.ts             # File validation and security utils
│   ├── geolocation.ts          # GPS utilities for time tracking
│   └── utils.ts                # General utilities (cn, etc.)
├── types/
│   └── timeLog.ts              # TimeLog TypeScript interfaces
└── middleware.ts               # Auth middleware for protected routes

prisma/
├── schema.prisma               # Database schema (12 models)
└── seed.ts                     # Database seeding script
```

### Database Models

The Prisma schema includes 12 models:

1. **User** - Users with roles: `client`, `admin`, `professional`, `worker`
2. **Service** - Services offered (tattoo, piercing, maintenance, etc.)
3. **Booking** - Service bookings with statuses: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`
4. **Review** - User reviews (1-5 stars)
5. **Message** - User messages to admin
6. **Feedback** - General platform feedback
7. **Survey** - Surveys with JSON questions
8. **SurveyResponse** - User survey responses (one per user per survey)
9. **GalleryItem** - Portfolio gallery images with categories
10. **QRCode** - QR codes for tracking with scan counts
11. **TimeLog** - Worker time tracking with GPS location and approval workflow
12. **InvitationToken** - Invitation links for admin to invite clients/workers

### Authentication System

**Current Implementation:** Custom JWT-based auth (not NextAuth v5 yet)

- **Login Flow:** POST `/api/auth/login` → JWT token in HTTP-only cookie
- **Token Validation:** Middleware checks JWT for protected routes (`/dashboard/*`, `/profile/*`)
- **Role-Based Access:** Admin routes require `role: "admin"` in JWT payload
- **Token Library:** Uses `jose` in middleware (Edge Runtime compatible), `jsonwebtoken` in API routes
- **Security:** HTTP-only cookies, secure flag in production, SameSite: lax

**Important Files:**
- [src/lib/auth.ts](src/lib/auth.ts) - JWT verification helper (Node.js runtime)
- [src/middleware.ts](src/middleware.ts) - Protected route middleware (Edge Runtime)
- [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts) - Login endpoint

**Test Credentials** (from seed data):
- Admin: `admin@crowleeart.com` / `123456`
- Client: `juan@email.com` / `123456`
- Client: `maria@email.com` / `123456`
- Worker: `worker@crowleeart.com` / `123456`

### API Route Patterns

All API routes follow REST conventions:

```typescript
// Standard pattern for protected API routes
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req)
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... handle request
}
```

**Admin Routes:** Always check `auth.user?.role === 'admin'` after authentication

**File Uploads:** Use [src/lib/security.ts](src/lib/security.ts) for image validation (magic numbers check)

### State Management

- **Global State:** Zustand (imported but minimal usage currently)
- **Server State:** React Query for API data fetching
- **Form State:** React Hook Form with Zod validation

### Component Patterns

**UI Components:** Follow shadcn/ui patterns with Radix UI primitives and Tailwind styling

**Client Components:** Must use `'use client'` directive when using hooks or browser APIs

**Server Components:** Default in App Router - use for data fetching when possible

### Environment Variables

Required in `.env.local`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/crowleeart"
JWT_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"  # For future NextAuth implementation
NEXTAUTH_SECRET="your-nextauth-secret"  # For future NextAuth implementation
```

### Docker Deployment

Production stack includes:
- PostgreSQL 15 (Alpine)
- Next.js app (standalone output)
- Nginx reverse proxy with SSL support

**Health Checks:**
- Database: `pg_isready`
- App: `GET /api/health`
- Nginx: `GET /health`

## Path Aliases

TypeScript paths configured in [tsconfig.json](tsconfig.json):

```typescript
import { Component } from '@/components/Component'  // src/components/Component
import { prisma } from '@/lib/db'                   // src/lib/db
```

## Migration Notes

This is a migrated project. Reference documentation:
- Original project review: `../CrowleeART/review.md`
- Migration plan: `../CrowleeART/MIGRATION_PLAN.md`
- Migration status: `../CrowleeART/MIGRATION_STATUS.md`

**Completed:** Phases 0-1 (Setup)
**Pending:** NextAuth v5 implementation, landing pages, full admin dashboard, booking system

## Key Configuration Files

- [next.config.ts](next.config.ts) - Standalone output for Docker, image optimization
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema
- [src/middleware.ts](src/middleware.ts) - Route protection
- [docker-compose.prod.yml](docker-compose.prod.yml) - Production deployment
- [eslint.config.mjs](eslint.config.mjs) - ESLint configuration (disabled in builds)

## Security Considerations

- File uploads validated by magic numbers (not just extensions) in [src/lib/security.ts](src/lib/security.ts)
- JWT tokens in HTTP-only cookies to prevent XSS
- Passwords hashed with bcryptjs (10 rounds)
- Middleware protects `/dashboard/*` and `/profile/*` routes
- Admin endpoints check role after authentication
- SQL injection prevented by Prisma's query builder
- GPS coordinates validated (lat: -90 to 90, lng: -180 to 180)
- Worker notes limited to 1000 characters

## Worker Time Tracking System

### Overview

Complete time tracking system with GPS geolocation for workers. Allows workers to clock in/out with automatic location capture, optional notes, and admin approval workflow.

### Database Schema

**TimeLog Model:**
```prisma
model TimeLog {
  id              Int      @id @default(autoincrement())
  userId          Int
  clockInTime     DateTime
  clockInLocation String   @db.Text // JSON: {latitude, longitude, timestamp, accuracy}
  clockOutTime    DateTime?
  clockOutLocation String? @db.Text
  workerNote      String?  @db.Text
  adminNote       String?  @db.Text
  status          String   @default("pending") // "pending", "approved", "rejected"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([clockInTime])
  @@index([clockOutTime])
}
```

**Location JSON Format:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timestamp": "2025-01-29T08:00:00.000Z",
  "accuracy": 10
}
```

### API Endpoints

**Worker Endpoints:**
- `GET /api/timelogs` - Get all time logs for authenticated worker
- `POST /api/timelogs` - Clock in with GPS location and optional note
- `GET /api/timelogs/active` - Get current active session (clocked in but not out)
- `PATCH /api/timelogs/[id]` - Clock out with GPS location and optional note

**Admin Endpoints:**
- `GET /api/admin/timelogs` - Get all time logs from all workers
- `PUT /api/admin/timelogs/[id]` - Update status, admin note, and edit clock in/out times
- `DELETE /api/admin/timelogs/[id]` - Delete time log

**Validations:**
- Cannot clock in if already clocked in
- Cannot clock out without active session
- GPS coordinates validated (lat: -90 to 90, lng: -180 to 180)
- Notes limited to 1000 characters
- Workers can only access their own time logs
- Admins can access all time logs

### Worker Dashboard

**Location:** [src/app/dashboard/worker/page.tsx](src/app/dashboard/worker/page.tsx)

**Features:**
- Large Clock In/Out button with loading states
- Current status indicator (Clocked In / Not Clocked In)
- Real-time elapsed time counter when clocked in
- Optional notes field for workers (e.g., "Left early due to rain")
- GPS location capture using browser geolocation API
- History table with:
  - Date, Clock In/Out times, Duration
  - Worker notes, Admin notes
  - Status badges (Pending/Approved/Rejected)
- Toast notifications for success/error
- Error handling for geolocation permissions

**Geolocation Utilities:** [src/lib/geolocation.ts](src/lib/geolocation.ts)
- `getCurrentPosition()` - Browser geolocation with error handling
- `formatLocation(location)` - Convert to JSON string
- `parseLocation(string)` - Parse JSON to object
- `calculateDuration(start, end)` - Calculate hours:minutes
- `formatCoordinates(location)` - Format lat,lng for display
- `getGoogleMapsLink(location)` - Generate Google Maps URL

### Admin Time Logs Management

**Component:** [src/components/admin/AdminTimeLogs.tsx](src/components/admin/AdminTimeLogs.tsx)

**Features:**
- Table view of all workers' time logs
- Columns: Worker, Clock In, Clock Out, Duration, Worker Note, Status, Actions
- GPS coordinates displayed as clickable Google Maps links
- Inline status selector (Pending/Approved/Rejected)
- Quick clock out button for in-progress sessions (orange LogOut icon)
- View/Edit dialog with:
  - Worker information
  - Editable clock in/out times with datetime-local inputs
  - "Now" button to set current time
  - "Clear" button to remove clock out (reopen session)
  - GPS locations as Google Maps links
  - Full worker note
  - Admin note textarea
  - Status selector
- Delete with confirmation
- Real-time updates via onUpdate callback

**Admin Time Editing:**
Admins can edit time logs for workers who forget to clock out or need corrections:
- Edit clock in time
- Edit clock out time or set to current time ("Now" button)
- Clear clock out to reopen a session
- Validation ensures clock out is after clock in

**Access:** Admin dashboard → Manage tab → Time Logs section

### Workflow

1. **Worker Clock In:**
   - Worker clicks "Clock In" button
   - Browser requests location permission
   - GPS location captured automatically
   - Worker adds optional note (e.g., "Starting morning shift")
   - POST to `/api/timelogs`
   - Status shows "Clocked In" with elapsed time

2. **Worker Clock Out:**
   - Worker clicks "Clock Out" button
   - GPS location captured for clock out
   - Worker adds optional note (e.g., "Finished all tasks")
   - PATCH to `/api/timelogs/[id]`
   - Status shows "Not Clocked In"
   - Entry appears in history table with duration

3. **Admin Review:**
   - Admin views time logs in dashboard
   - Clicks GPS coordinates to verify locations on Google Maps
   - Reads worker notes
   - Changes status to "Approved" or "Rejected"
   - Adds admin note (e.g., "Approved, great work")
   - Worker sees status and admin note in their history

### Route Protection

**Middleware:** [src/middleware.ts](src/middleware.ts)

Worker dashboard protected:
```typescript
if (pathname.startsWith('/dashboard/worker') && payload.role !== 'worker') {
  return NextResponse.redirect(homeUrl)
}
```

Only users with `role: "worker"` can access `/dashboard/worker`

### Testing the System

1. **Create worker user:**
   ```bash
   # Option 1: Run the create-worker script
   node create-worker.js

   # Option 2: Manually in database
   # Update existing user: UPDATE "User" SET role = 'worker' WHERE email = 'user@example.com'
   ```

2. **Login as worker:**
   - Go to http://localhost:3000/login
   - Email: `worker@crowleeart.com`
   - Password: `123456`

3. **Test Clock In:**
   - Navigate to `/dashboard/worker`
   - Click "Clock In"
   - Allow location permissions in browser
   - Add optional note
   - Verify GPS captured and session active

4. **Test Clock Out:**
   - Click "Clock Out"
   - Allow location permissions
   - Add optional note
   - Verify duration calculated
   - Check history table

5. **Test Admin Flow:**
   - Login as admin (`admin@crowleeart.com` / `123456`)
   - Go to Admin Dashboard → Manage → Time Logs
   - View worker's time log
   - Click GPS coordinates → Opens Google Maps
   - Change status to "Approved"
   - Add admin note
   - Worker will see changes in their history

### Common Issues

**Geolocation Permission Denied:**
- Browser blocks location access
- User must enable location in browser settings
- Clear error messages guide user to fix

**Already Clocked In:**
- Cannot clock in twice
- Must clock out first
- API returns 409 Conflict

**No Active Session:**
- Cannot clock out without active session
- Clock In button shown instead

**Invalid Coordinates:**
- Out of range coordinates rejected
- Lat must be -90 to 90
- Lng must be -180 to 180

### Future Enhancements

Potential improvements not in current implementation:
- Geofencing (validate location within allowed area)
- Reports & analytics (weekly/monthly summaries)
- Export to Excel/PDF
- Photo verification (selfie on clock in/out)
- Shift management (predefined schedules)
- Overtime calculation
- Mobile app for better GPS accuracy

## Invitation System

### Overview

Admin can generate invitation links to invite new users as clients or workers. Links are single-use and have configurable expiration.

### Database Schema

**InvitationToken Model:**
```prisma
model InvitationToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  role      String   // "client" or "worker"
  expiresAt DateTime
  usedAt    DateTime?
  usedBy    Int?     // userId who used this token
  createdAt DateTime @default(now())

  @@index([token])
  @@index([expiresAt])
}
```

### API Endpoints

**Admin Endpoints:**
- `GET /api/admin/invitations` - List all invitation tokens
- `POST /api/admin/invitations` - Create new invitation with role and expiration
- `DELETE /api/admin/invitations/[id]` - Delete invitation token

**Public Endpoints:**
- `GET /api/invitations/validate?token=xxx` - Validate token (returns role if valid)

### Flow

1. **Admin Creates Invitation:**
   - Goes to Admin Dashboard → Manage → Invitations
   - Selects role (client or worker)
   - Selects expiration (1 hour, 24 hours, 7 days, 30 days)
   - Clicks "Generate Link"
   - Copies shareable URL (e.g., `https://domain.com/login?invite=abc123`)

2. **User Receives Link:**
   - Opens invitation link
   - Login page validates token and shows role badge
   - User fills registration form
   - On submit, token is consumed and user gets assigned role

3. **Token States:**
   - **Active:** Valid, not used, not expired
   - **Used:** Already consumed by a user
   - **Expired:** Past expiration date

### Admin Component

**Location:** [src/components/admin/AdminInvitations.tsx](src/components/admin/AdminInvitations.tsx)

**Features:**
- Generate new invitation links
- Role selector (Client/Worker)
- Expiration selector (1h, 24h, 7d, 30d)
- Copy link to clipboard
- Table showing all invitations with status
- Delete unused invitations

### Security

- Tokens are cryptographically random (32 bytes hex)
- Single-use only (marked as used after registration)
- Configurable expiration
- Only admins can create/view/delete invitations
- Token validation is public but reveals only role
