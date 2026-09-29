# DonorConnect frontend

React interface for the DonorConnect donation and request API.

## Run locally

Use Node.js 22.12+ in the 22.x line. From this directory:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The backend must run separately at
`http://localhost:3000`; the API client in `src/api.js` currently uses that
address directly.

## Implemented UI

- Landing, registration and login pages.
- Donation browsing and donor donation creation/management.
- Request management.
- Authentication and notification contexts and a protected-route component.

The API client attaches the JWT stored in browser local storage. Client route
guards improve navigation but do not replace server-side authorization.

## Build and checks

```bash
npm run build
npm run preview
npm run lint
```

The production bundle and lint both pass with Node.js 22.13 during the
29 September 2026 review. Context hooks live in separate modules from provider
components, initial authentication loading is derived from token presence, and
data-fetch callbacks declare their dependencies.

The preview command serves the built frontend locally. It is not a complete
deployment: configurable API URLs, token-handling decisions, backend
hardening, persistent uploads and end-to-end checks are still needed.

See [the repository overview](../README.md).
