# DonorConnect API

Express/Mongoose backend for the DonorConnect student application.
Start from this directory, not the repository root.

## Setup

Use Node.js 22.12+ in the 22.x line and a development MongoDB database.

```bash
npm ci
```

Supply the following values privately to the process:

| Variable | Meaning |
| --- | --- |
| `MONGO_URI` | Connection string for an isolated development database |
| `JWT_SECRET` | Strong, unique JWT signing secret |
| `PORT` | Optional HTTP port; defaults to 3000 |

Set the variables before launching Node. The current auth modules capture their
configuration during module import, so process environment variables avoid
depending on dotenv import order. There is an unsafe development fallback in
the current code; always provide `JWT_SECRET`. Removing that fallback and
validating configuration at startup remain hardening work.

Create the local upload directory if it does not exist:

```bash
node -e "require('node:fs').mkdirSync('uploads', { recursive: true })"
npm run dev
```

For a normal process without the development watcher, use `npm start`.
Startup waits for MongoDB connectivity before accepting requests.

```bash
curl --fail http://localhost:3000/api/health
```

On Windows PowerShell, use `curl.exe` for the same curl command.

## API map

| Prefix | Implemented route family |
| --- | --- |
| `/api/auth` | Registration, login and current user |
| `/api/users` | Administrative user management and first-admin bootstrap |
| `/api/donations` | Public list/detail, donor list and mutation routes |
| `/api/requests` | Request management and accept/reject/cancel transitions |
| `/uploads` | Static uploaded files |

Login returns a JWT used as `Authorization: Bearer <token>`.
Donations can use multipart form data with an `image` field; the upload
middleware limits file size to 5 MB and checks the supplied MIME type.
A MIME check alone is not content validation.

## Tests and development limits

```bash
npm test
npm run lint
```

The current baseline is 9 passing utility tests and 6 failing legacy HTTP
tests. Lint cannot run without an ESLint configuration. The nested workflow
also needs relocation and working-directory changes before it becomes active
for this monorepo.

This API needs an authorization and credential-handling hardening pass before
public deployment. Treat admin bootstrap and diagnostic routes as
development-only functionality. An isolated local demo is the intended scope
of these instructions.

See [the repository overview](../README.md) for complete review status.
