# Willow Clinic — Doctor Appointment Booking System (MERN)

A full-stack appointment booking app: patients browse doctors and book open
slots, doctors publish availability and manage the requests that come in.

Stack: **M**ongoDB, **E**xpress, **R**eact, **N**ode — plus JWT auth and bcrypt
password hashing.

## Project structure

```
doctor-appointment-system/
├── backend/     Express API + MongoDB models
└── frontend/    React app (Create React App)
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

## Extending it

Some natural next steps if you want to keep building on this for practice:
- Email/SMS reminders when a doctor confirms a booking
- Doctor search by name, not just specialization
- Recurring weekly availability instead of adding one slot at a time
- An admin role that can see all doctors and appointments across the clinic
