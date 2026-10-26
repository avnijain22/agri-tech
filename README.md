# 🌾 AgriTech – Smart Farming Platform (MERN)

Full-stack farm management app for farmers: farm profiles, crop & soil tracking, 7-day weather, pest-risk alerts,
resource store with order tracking, community forum, expert consultation and an admin dashboard.
Interface is responsive and available in **English, हिन्दी and मराठी**.

**Stack:** MongoDB · Express · React (Vite) · Node.js · Bootstrap 5 · Axios · React Router · Recharts · JWT · bcrypt

## Features
| Module | What it does |
|---|---|
| Auth & roles | Register/login with JWT, bcrypt passwords, roles `farmer`, `expert`, `admin` |
| Farms | CRUD, GPS location, soil type, irrigation |
| Crops & soil | CRUD, activity log, soil test → health score and fertilizer advice |
| Weather & pests | Free Open-Meteo forecast (no API key), cached 30 min, rule-based pest risks, admin alerts |
| Resources & orders | Store, cart, server-side pricing, stock control, order status flow |
| Community & experts | Public forum; private consultations answered by experts |
| Admin | Stats, user roles/deactivation, alerts, resource and order management, post moderation |

## Project structure
```
agritech/
├─ client/            React app (Vite)
│  └─ src/{pages,components,api,i18n}
├─ server/            Express API
│  └─ src/{config,middleware,models,routes,utils}
├─ Dockerfile         Builds client + server into one image
├─ render.yaml        Render Blueprint (one-click deploy)
└─ .github/workflows  CI (tests, build, docker build)
```

## Database (MongoDB collections)
`users`, `farms`, `crops`, `orders`, `resources`, `weatherdatas`, `posts`, `alerts` – linked by ObjectId references
(`farm.owner → user`, `crop.farm → farm`, `order.owner → user`, …).

## Run locally
Requires Node 18+ and a MongoDB (local or Atlas).
```bash
cp .env.example server/.env      # edit MONGO_URI and JWT_SECRET
npm run install:all
npm run dev:server               # API on :5000
npm run dev:client               # App on :5173
```
Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env` to auto-create the first admin; sample store items are seeded on first start.

## Deploy (no local installs needed)
1. **Database:** create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas), add a database user, allow network access (0.0.0.0/0 for a demo) and copy the connection string.
2. **Host:** on [Render](https://render.com) choose *New → Blueprint*, select this GitHub repo. Render builds the `Dockerfile`.
3. In the Render dashboard set `MONGO_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (`JWT_SECRET` is generated).
4. Open the Render URL – the Express server serves both the API and the React app. Health check: `/api/health`.

Alternative: any Docker host – `docker build -t agritech . && docker run -p 5000:5000 --env-file .env agritech`.

## API overview (all except `/auth/*` and `/health` need `Authorization: Bearer <token>`)
`POST /api/auth/register|login` · `GET|PATCH /api/auth/me` · `/api/farms` CRUD · `/api/crops` CRUD, `GET /:id/analysis`, `POST /:id/activity` ·
`GET /api/weather/farm/:farmId` · `/api/resources` (write = admin) · `/api/orders` (+ `PATCH /:id/cancel`, `/:id/status` admin) ·
`/api/posts` (+ `/:id/reply`, `/:id/hide` admin) · `/api/admin/stats|users` · `/api/dashboard`

Import-ready Postman checks: register → login → create farm → create crop → `GET /crops/:id/analysis` → `GET /weather/farm/:id`.

## Security
bcrypt (cost 12), JWT auth, role checks on every sensitive route, helmet, rate-limited auth, validation with express-validator,
owner-scoped queries (farmers only see their data), prices and stock computed server-side, public signup can never create admins.

## Performance & maintenance
Lazy-loaded routes and vendor chunking, weather caching, indexed owner fields, centralized error handler with file logging (`server/logs/error.log`),
reusable CRUD factory for modular controllers.

## Tests
`npm test` runs unit tests for soil analysis and pest-risk logic.

## License
MIT
