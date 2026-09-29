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
| `ENABLE_ADMIN_BOOTSTRAP` | Optional; defaults off. Set `true` only during controlled, isolated first-admin setup |

Set the variables before launching Node, or use an existing ignored local
environment file. Shared authentication configuration loads dotenv before use;
startup rejects a missing signing secret or the former development fallback.
Never publish credentials or modify a shared environment file for a test run.

First-admin bootstrap is disabled by default. Enable it only in an isolated
local setup, create the first administrator, then disable it and restart before
exposing the API. The existing-admin guard remains, but this opt-in bootstrap
is not intended to be a public onboarding mechanism.

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

The local baseline is 30 passing tests and clean lint. Two additional integration
cases run when `TEST_MONGO_URI` names a disposable loopback MongoDB service.
CI provisions that service automatically. The tests create and remove only their
own randomly named database; they do not read application database credentials.

Coverage includes current health behavior, registration-role restrictions,
password hashing, JWT configuration, bootstrap gating, user update filtering and
donation deletion ownership. The former `/info`, `/version` and `/boom` HTTP
tests were replaced because those routes are not part of the current app;
their utility-level tests remain.

This API needs an authorization and credential-handling hardening pass before
public deployment. Treat admin bootstrap and diagnostic routes as
development-only functionality. An isolated local demo is the intended scope
of these instructions.

See [the repository overview](../README.md) for complete review status.
