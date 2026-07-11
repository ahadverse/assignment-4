# GearUp API

Backend REST API for **GearUp** — a sports and outdoor gear rental platform. Customers browse and rent gear, providers manage inventory and fulfil orders, and admins oversee the platform.

- **Live API:** `<your-render-url>`
- **API docs (Swagger):** `<your-render-url>/api-docs`

## Overview

GearUp lets three roles interact with a rental marketplace:

| Role | Can do |
|------|--------|
| **Customer** | Browse gear, place rental orders, pay via Stripe, track status, review gear once paid or returned |
| **Provider** | Manage gear inventory and stock, view incoming orders, advance order status |
| **Admin** | Manage users (suspend/activate), oversee all gear and rentals, manage categories |

## Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication (role based)
- Zod request validation
- Stripe (checkout sessions + webhook)
- Swagger UI (`swagger-jsdoc` + `swagger-ui-express`)

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or hosted, e.g. Neon)
- A Stripe account (test keys are fine)

### Installation

```bash
git clone https://github.com/ahadverse/assignment-4.git
cd assignment-4
npm install
```

Create a `.env` file in the project root and set the variables listed under [Environment Variables](#environment-variables).

Generate the Prisma client, run the migrations, and seed the database:

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

Start the dev server:

```bash
npm run dev
```

The API runs at `http://localhost:5000` and docs at `http://localhost:5000/api-docs`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default `5000`) |
| `CLIENT_URL` | Allowed CORS origin(s), comma separated, or `*` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds (default `12`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin credentials |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (set after creating the webhook) |
| `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` | Stripe checkout redirect URLs |

## API Endpoints

Base path: `/api`

> **Admin override**: `ADMIN` always passes every role check (`authorize(...)`) and every per-resource ownership check, regardless of the `Access` column below. Admin can create/manage gear, rentals, payments, and reviews on behalf of any user, and "list my own X" endpoints (`/rentals`, `/payments`, `/provider/orders`) return the platform-wide list instead of an empty one when called by an admin. Records created this way (payments, reviews) are still attributed to the resource's real owner, not the admin, so data stays consistent.

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Authenticated |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| PATCH | `/users/me` | Authenticated |

### Categories
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/categories` | Public |
| POST | `/categories` | Admin |
| PATCH | `/categories/:id` | Admin |
| DELETE | `/categories/:id` | Admin |

### Gear (public)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/gear` | Public (filters: category [id OR name, case-insensitive], brand, search, minPrice, maxPrice, availability) |
| GET | `/gear/:id` | Public |
| GET | `/gear/:id/reviews` | Public |

### Provider
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/provider/gear` | Provider |
| PUT | `/provider/gear/:id` | Provider |
| DELETE | `/provider/gear/:id` | Provider |
| GET | `/provider/orders` | Provider |
| PATCH | `/provider/orders/:id` | Provider |

### Rentals
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/rentals` | Customer |
| GET | `/rentals` | Customer |
| GET | `/rentals/:id` | Owner / Admin |

### Payments
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/payments/create` | Customer |
| POST | `/payments/confirm` | Customer |
| POST | `/payments/webhook` | Stripe (raw body) |
| GET | `/payments` | Customer |
| GET | `/payments/:id` | Owner / Admin |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/reviews` | Customer (after return) |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/admin/users` | Admin |
| PATCH | `/admin/users/:id` | Admin |
| GET | `/admin/gear` | Admin |
| GET | `/admin/rentals` | Admin |

## Rental Order Lifecycle

```
PLACED ──confirm(provider)──> CONFIRMED ──payment──> PAID ──pickup(provider)──> PICKED_UP ──return(provider)──> RETURNED
   │
   └──cancel──> CANCELLED
```

- Stock is decremented when an order is **CONFIRMED** and restored when it is **RETURNED**.
- An order can only be **PICKED_UP** after its payment is **COMPLETED**.
- A review can only be left once an order is **PAID** or **RETURNED**, one review per order.

## Payments (Stripe)

1. Customer calls `POST /payments/create` for a **CONFIRMED** order → returns a Stripe Checkout URL and a `PENDING` payment.
2. Customer completes payment on Stripe.
3. Either Stripe calls `POST /payments/webhook` (async, signature-verified), or the customer calls `POST /payments/confirm` (sync, checks the session status directly with Stripe) — both mark the payment `COMPLETED` and move the order to `PAID`.

The webhook route reads the raw request body and always verifies the Stripe signature via `STRIPE_WEBHOOK_SECRET` — requests without a valid signature are rejected with 400. After deploying, create a webhook in the Stripe dashboard pointing to `<your-render-url>/api/payments/webhook` and set `STRIPE_WEBHOOK_SECRET`. For local testing without the Stripe CLI, use `POST /payments/confirm` instead of the webhook.

## Default Credentials (from seed)

- **Admin:** `admin@gearup.com` / `Admin@1234`
- **Sample providers:** `peakgear@gearup.com` / `Provider@1234`, `riverside@gearup.com` / `Provider@1234`
- **Sample customers:** `alex.customer@gearup.com`, `jamie.customer@gearup.com`, `sam.customer@gearup.com` — all `Customer@1234`

Override the admin credentials with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables.

The seed also creates one rental order per `RentalStatus` value (PLACED, CONFIRMED, CANCELLED, PAID, PICKED_UP, RETURNED) across the sample customers, with matching `Payment` rows for the paid ones and a `Review` on the returned order — so every table has realistic demo data out of the box, not just users/categories/gear.

## Deployment (Render)

This repo includes a `render.yaml` blueprint.

1. Push the repo to GitHub.
2. On Render, create a **New Blueprint** and select this repository.
3. Set the secret env vars (marked `sync: false`): `DATABASE_URL`, `ADMIN_PASSWORD`, and the `STRIPE_*` values. Point `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` at your deployed URL.
4. Deploy. The build runs `prisma migrate deploy` and the seed automatically.
5. Create the Stripe webhook (see above) and set `STRIPE_WEBHOOK_SECRET`.

> If you reuse an existing database whose migration history was recorded under a different name, run `npx prisma migrate reset` once against it before the first `migrate deploy`, otherwise the deploy migration step fails. A fresh database needs no reset.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server with reload |
| `npm run build` | Compile TypeScript to `dist` |
| `npm start` | Run the compiled server |
| `npm run seed` | Seed the admin and sample data |
| `npm run prisma:migrate` | Run Prisma migrations (dev) |
| `npm run prisma:studio` | Open Prisma Studio |
