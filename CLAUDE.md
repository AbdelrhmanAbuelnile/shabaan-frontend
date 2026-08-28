# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The public-facing Arabic RTL landing page for SHABAAN's online personal training / nutrition coaching service, plus a small `/admin` dashboard for managing a subset of the page's images/voicenotes. Standalone Vite + React 19 + TypeScript app, no pnpm workspace, no Replit tooling — split out of a former monorepo. Talks to the sibling `shabaan-backend` repo over HTTP for admin auth and content-asset data; subscription/contact actions on the public page itself are still plain `wa.me` WhatsApp deep links, no backend involvement there.

## Commands

- `npm run dev` — dev server, http://localhost:5173
- `npm run build` — production build to `dist/`
- `npm run serve` — preview the production build locally
- `npm run typecheck` — `tsc --noEmit`
- No test runner is configured.

Env: `VITE_API_URL` (backend base URL, no `/api` suffix — see `.env.example`). Defaults to `http://localhost:8080` if unset, which matches the backend's own local default, so local dev needs no `.env` at all.

## Architecture

**Public page (`src/App.tsx`):** one large `Home` component — hero, plans, "how it works" steps, results gallery, audio testimonials, FAQ, footer. The chat-screenshot section (`#proof`) that used to sit between testimonials and FAQ was removed entirely at the user's request — it's not coming back as static content or an admin-editable section, don't reintroduce it.

The results gallery (`gallery-1`..`gallery-6`) and audio testimonials (`testimonial-1`..`testimonial-6`) — plus any admin-added extras beyond those 12, see below — read their URLs from `useAssets()` (`src/hooks/use-assets.ts`, `GET /api/assets`, react-query, `retry: false`), falling back to the original bundled `public/assets` files (`src/lib/slots.ts`) whenever a fixed slot has no backend asset yet or the request fails outright (no `MONGODB_URI` configured, backend down, etc.). This fallback is why `retry: false` matters here — react-query's default retry-with-backoff would leave the admin dashboard's slot cards showing a stuck loading spinner for several seconds on any failure before falling back; the public page isn't blocked by it either way since it just reads `asset?.url ?? fallback`, but the retry storm was pointless network noise.

**Admin (`src/pages/admin-login.tsx`, `src/pages/admin-dashboard.tsx`):** `/admin` is a login form (`POST /api/auth/login` via `useLogin`). `/admin/dashboard` is **client-side gated only** — it checks `GET /api/auth/me` (`useMe`) and redirects to `/admin` if unauthenticated. The real access control is server-side (`requireAdmin` on the backend's mutating routes); the client-side gate is just UX, not security — someone could view the dashboard's public `GET /api/assets` data without logging in (that data is already public on the live site), but every upload/CRM mutation still 401s without a valid session cookie.

**Cloudinary direct upload (`src/lib/api.ts`):** the browser never sends the file through this backend. Flow: `getUploadSignature(type)` → `POST /api/uploads/signature` (admin-only, returns a signed `{signature, timestamp, folder, apiKey, cloudName}`) → `uploadToCloudinary()` posts the file straight to `https://api.cloudinary.com/v1_1/<cloudName>/auto/upload` with those params → `replaceAsset(slot, ...)` → `PUT /api/assets/:slot` persists the resulting `secure_url`/`public_id`. All three steps are chained inside `useUploadAsset()` (`src/hooks/use-assets.ts`) as one mutation.

**Auth cookie is cross-origin.** Frontend and backend are separate Vercel deployments (different domains), so every backend call goes through `apiFetch()` (`src/lib/api.ts`) with `credentials: 'include'`, and the backend's CORS config must explicitly allow this frontend's origin with `credentials: true` (wildcard CORS can't carry cookies). If admin login stops working after a deploy, check the backend's `FRONTEND_URL` env var first.

## Gotchas

- `src/components/ui/` is shadcn/radix-generated tooling output — treat as a component library, not hand-maintained app code, unless a specific primitive needs a real fix.
- `src/lib/slots.ts` is the single place mapping slot IDs (`gallery-N`, `testimonial-N`) to their static-fallback file paths. Both `App.tsx` (public page) and `admin-dashboard.tsx` import from it — keep them in sync by editing this file, not by hardcoding slot lists in either page.
- If you add a new admin-manageable slot, it needs: an entry in `src/lib/slots.ts`, a matching static fallback file under `public/assets/`, and the corresponding section in `App.tsx` needs to actually read from `useAssets()` for that slot (adding it to `slots.ts` alone does nothing to the public page).
- `vercel.json`'s SPA rewrite (`/(.*)` → `/index.html`) is required for `/admin`, `/admin/dashboard` etc. to survive a hard refresh — without it Vercel 404s any path that isn't a real static file, since `wouter`'s routing is entirely client-side.
