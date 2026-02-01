# Monorepo Template

A full-stack monorepo template with a **web app** (TanStack Start) and **mobile app** (Expo) sharing a **Convex** backend with **Better Auth** authentication.

## Tech Stack

- **Monorepo:** [Turborepo](https://turbo.build/) + [Bun](https://bun.sh/)
- **Web:** [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Mobile:** [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/) + [Expo Router](https://docs.expo.dev/router/introduction/)
- **Backend:** [Convex](https://convex.dev/)
- **Auth:** [Better Auth](https://better-auth.com/) (Google OAuth, magic link, anonymous, 2FA)
- **Linting/Formatting:** [Biome](https://biomejs.dev/)

## Project Structure

```
├── apps/
│   ├── web/          # TanStack Start web application
│   └── mobile/       # Expo React Native mobile app
├── packages/
│   ├── backend/      # Convex backend (shared between web & mobile)
│   └── typescript-config/  # Shared TypeScript configs
├── turbo.json        # Turborepo task configuration
├── biome.json        # Biome linter/formatter config
└── package.json      # Root workspace config
```

## Prerequisites

- [Bun](https://bun.sh/) (v1.3.6+)
- A [Convex](https://convex.dev/) account (free tier available)
- (Optional) [Google Cloud Console](https://console.cloud.google.com/) project for Google OAuth

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Set up Convex

Initialize your Convex project from the backend package:

```bash
cd packages/backend
npx convex dev
```

This will prompt you to log in to Convex and create a new project. It will generate your deployment URL.

### 3. Configure environment variables

#### Web app (`apps/web/.env`)

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
```

#### Mobile app (`apps/mobile/.env`)

```env
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
```

#### Convex backend environment variables

Set these in the [Convex dashboard](https://dashboard.convex.dev/) under your project's Settings > Environment Variables:

```env
BETTER_AUTH_SECRET=your-random-secret-string
SITE_URL=http://localhost:3000

# Google OAuth (optional — remove from auth.ts if not needed)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

To generate a `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Run the dev servers

From the root directory, start all apps:

```bash
bun dev
```

This starts:
- **Web app** at `http://localhost:3000`
- **Convex** backend in dev mode

To run the mobile app separately:

```bash
cd apps/mobile
bun run dev
```

## Auth Setup

Authentication is pre-configured with [Better Auth](https://better-auth.com/) integrated into Convex. The following auth methods are available:

- **Anonymous** — auto-create anonymous sessions
- **Google OAuth** — requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- **Magic Link** — requires you to plug in an email service (see `packages/backend/convex/auth.ts`)
- **Two-Factor (2FA)** — TOTP-based second factor

The auth plumbing is wired up in:

| File | Purpose |
|------|---------|
| `packages/backend/convex/auth.ts` | Server-side auth config & user helpers |
| `packages/backend/convex/auth.config.ts` | Convex auth config provider |
| `packages/backend/convex/http.ts` | Auth HTTP routes |
| `apps/web/src/lib/auth-client.ts` | Web auth client |
| `apps/web/src/lib/auth-server.ts` | Web server-side auth (SSR) |
| `apps/web/src/routes/api/auth/$.ts` | Web auth API route handler |
| `apps/mobile/lib/auth-client.ts` | Mobile auth client (with SecureStore) |

### Magic Link Email

The magic link plugin is configured but needs an email service. In `packages/backend/convex/auth.ts`, replace the `console.log` in `sendMagicLink` with your email provider (e.g. [Resend](https://resend.com/), [SendGrid](https://sendgrid.com/)).

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start all apps in development mode |
| `bun run build` | Build all apps |
| `bun run format-and-lint` | Check formatting and linting with Biome |
| `bun run format-and-lint:fix` | Auto-fix formatting and linting issues |
| `bun run check-types` | Type-check all packages |

## Customization

1. **Rename the project:** Update `name` fields in root `package.json` and all `packages/*/package.json` and `apps/*/package.json`
2. **Add your schema:** Define your database tables in `packages/backend/convex/schema.ts`
3. **Add backend functions:** Create new files in `packages/backend/convex/` for your queries, mutations, and actions
4. **Add web routes:** Create new route files in `apps/web/src/routes/`
5. **Add mobile screens:** Create new screen files in `apps/mobile/app/`
6. **Update trusted origins:** Add your production URLs to the `trustedOrigins` array in `packages/backend/convex/auth.ts`
7. **Update mobile scheme:** Change the `scheme` in `apps/mobile/app.json` to your app's URL scheme
