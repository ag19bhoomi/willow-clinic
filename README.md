# Willow Clinic — Doctor Appointment Booking System (MERN)

A full-stack appointment booking app: patients browse doctors and book open
slots, doctors publish availability and manage the requests that come in.

Stack: **M**ongoDB, **E**xpress, **R**eact, **N**ode — plus JWT auth and bcrypt
password hashing.

## Features

- **Two account types, one login system** — patients and doctors sign up
  through the same form; a `role` field decides what they see.
- **Doctor directory** — browse all doctors, filter by specialization.
- **Slot-based booking** — doctors publish specific date/time slots; patients
  pick an open one and it's instantly marked booked (no double-booking).
- **Appointment lifecycle** — `pending` → `confirmed` → `completed`, or
  `cancelled` by either side, with the slot freed up again on cancellation.
- **JWT authentication** — stateless auth with bcrypt-hashed passwords.
- **Doctor dashboard** — add/remove availability, confirm or complete
  bookings, see history.
- **Patient dashboard** — see all bookings grouped by date, cancel if needed.

## Project structure

```
doctor-appointment-system/
├── backend/     Express API + MongoDB models
│   ├── models/          User, DoctorProfile, Appointment (Mongoose schemas)
│   ├── routes/          auth, doctors, appointments
│   ├── middleware/       JWT auth + role checks
│   ├── seed.js          optional sample-data script
│   └── server.js        entry point
└── frontend/    React app (Create React App)
    └── src/
        ├── pages/        Home, Login, Register, DoctorDirectory, DoctorDetail,
        │                 PatientDashboard, DoctorDashboard
        ├── components/   Topbar, ProtectedRoute
        ├── context/      AuthContext (holds logged-in user + token)
        └── styles/       global.css (design tokens live here)
```

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — either:
  - local MongoDB running on `mongodb://127.0.0.1:27017`, or
  - a free MongoDB Atlas cluster (get the connection string from Atlas)

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/doctor_appointments
JWT_SECRET=some_long_random_string
```

Start it:
```bash
npm run dev      # requires nodemon (installed as a devDependency)
# or
npm start
```

You should see `Server running on http://localhost:5000` and a MongoDB
connected message.

### Optional: seed a few sample doctors

```bash
node seed.js
```

This creates three doctors (Cardiology, Dermatology, Pediatrics) each with a
couple of open slots, so the frontend has something to show immediately.
Every seeded doctor's password is `password123`.

## 3. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm start
```

This opens `http://localhost:3000`. It talks to the backend at
`http://localhost:5000/api` by default — if you change the backend port,
create a `frontend/.env` with:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## 4. Trying it out

1. Go to `http://localhost:3000/register`, sign up as a **doctor**, and add a
   specialization.
2. Log in as that doctor, go to the dashboard, and add a date + time slot
   under "Add availability".
3. Open an incognito window (or log out) and register as a **patient**.
4. Go to "Find a doctor", open the doctor you just created, pick the slot,
   and confirm.
5. Log back in as the doctor to see the booking appear, and confirm/complete
   it from the dashboard.

## How the pieces fit together

- **User** — shared login for patients and doctors (`role` field).
- **DoctorProfile** — one per doctor user; holds specialization, fee, and an
  `availability` array of `{ date, slots: [{ time, isBooked }] }`.
- **Appointment** — links a patient to a doctor for a given date/time, with a
  `status` (`pending` → `confirmed` → `completed`, or `cancelled`).

Booking a slot sets `isBooked: true` on that slot and creates an
`Appointment`; cancelling (by either side) flips the slot back to open.

## API reference

All routes are prefixed with `/api`. Routes marked 🔒 require a
`Authorization: Bearer <token>` header.

| Method | Route | Who | Purpose |
|---|---|---|---|
| POST | `/auth/register` | anyone | Create a patient or doctor account |
| POST | `/auth/login` | anyone | Log in, returns a JWT |
| GET | `/doctors` | anyone | List doctors, optional `?specialization=` filter |
| GET | `/doctors/:id` | anyone | One doctor's profile + availability |
| GET | `/doctors/me/profile` | 🔒 doctor | The logged-in doctor's own profile |
| PUT | `/doctors/me/profile` | 🔒 doctor | Update profile fields |
| POST | `/doctors/me/availability` | 🔒 doctor | Add a date + time slot(s) |
| DELETE | `/doctors/me/availability/:date/:slotId` | 🔒 doctor | Remove an open slot |
| POST | `/appointments` | 🔒 patient | Book a slot |
| GET | `/appointments/mine` | 🔒 both | List your own appointments |
| PATCH | `/appointments/:id/status` | 🔒 doctor | Confirm / complete / cancel |
| DELETE | `/appointments/:id` | 🔒 patient | Cancel your own booking |

## Troubleshooting

**`'nodemon' is not recognized...` (Windows)**
You haven't run `npm install` yet in `backend/` — nodemon is a
devDependency, so it only appears after install. Run `npm install`, then
`npm run dev` again. Or just use `npm start` instead, which doesn't need
nodemon at all.

**Server hangs or throws a Mongo connection error**
Almost always one of: wrong `MONGO_URI` in `.env`, a password with special
characters that needs URL-encoding, or (for Atlas) the IP address isn't
whitelisted under Network Access. Double-check `.env` — not
`.env.example`, which is just a template and is ignored by the app.

**Frontend loads but shows no doctors / requests fail**
Confirm the backend is actually running on port 5000 first (check the
terminal for `Server running on http://localhost:5000`), and that no
firewall/antivirus is blocking local connections between the two dev
servers.

**"An account with this email already exists"**
Either you already registered that email, or you ran `seed.js` and are
trying to reuse a seeded doctor's email through the sign-up form — log in
with that email + `password123` instead.

## Extending it

Some natural next steps if you want to keep building on this for practice:
- Email/SMS reminders when a doctor confirms a booking
- Doctor search by name, not just specialization
- Recurring weekly availability instead of adding one slot at a time
- An admin role that can see all doctors and appointments across the clinic
