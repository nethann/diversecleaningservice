# diversecleaningservice

diversecleaningservice is a modern cleaning service booking platform with a customer-facing booking flow, landing page, admin scheduling tools, cleaner daily view, and an Express/PostgreSQL backend starter.

## Stack

- Frontend: Next.js 14, React, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL schema included in `database/schema.sql`
- Auth: JWT-ready backend structure
- Payments: Stripe-ready payment model

## Project Structure

- `frontend/` Next.js application
- `backend/` Express API starter
- `database/` PostgreSQL schema and seed data

## Frontend Pages

- `/` landing page
- `/booking` online booking flow
- `/admin` admin dashboard
- `/customer` customer account area
- `/cleaner` cleaner mobile-style daily schedule

## Backend Endpoints

- `GET /api/services`
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/:id`
- `DELETE /api/bookings/:id`
- `GET /api/staff`
- `POST /api/payments/intent`
- `GET /api/dashboard`

The backend uses in-memory demo data so the UI and API contract are usable immediately. Replace the data layer with PostgreSQL queries and Stripe SDK calls for production use.

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Database

Use `database/schema.sql` to create the PostgreSQL schema and `database/seed.sql` for sample records.

## Notes

- Booking validation includes time-slot collision checks.
- The UI is mobile friendly and optimized for a fast booking flow.
- Notifications, payments, and calendar interactions are modeled in the product surface and backend contract.
