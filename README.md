# CarePlus Hospital — MERN Migration

This project migrates the uploaded CarePlus Hospital Node/Express/EJS project to the MERN stack while keeping the same high-level project structure as MediSlot:

```text
frontend/
  src/
    components/shared.jsx
    lib/pageImports.js
    pages/                 # one JSX file per page
    routes/AppRoutes.jsx
    App.jsx                # route entry only
    api.js
    main.jsx
    styles.css
backend/
  config/
  controllers/
    auth/                  # login/register/logout/me
    doctor/
    appointment/
    admin/
    package/
    enquiry/
    location/
    career/
    apiController.js       # compatibility aggregator
  middleware/
  models/
  routes/                  # feature-specific routers + index.js
  utils/
  app.js
  .env.example
```

## Migrated functionality

- Patient and doctor registration/login; doctor accounts require admin approval.
- Session-based authentication with role-protected patient, doctor and admin dashboards.
- Appointment request with OTP verification (for local development, OTP is printed in the backend terminal, matching the original project's behavior; configure an SMS provider before production use).
- Patient appointment history and cancellation; doctor can update appointment status; admin can view/manage appointments.
- Admin dashboard: approve pending doctors, view doctors and patients, delete users.
- Health packages from MongoDB, package details, search and category/gender filters.
- Home enquiry form saves to MongoDB and attempts email notification when SMTP/Gmail variables are configured.
- Wellness/hospital locations page using the original uploaded hospital image assets.
- Careers page.

## Requirements

- Node.js 18.18+ (Node 20 LTS recommended)
- MongoDB local or hosted instance

## Setup

1. Open `backend/.env.example`, copy it to `backend/.env`, then set `MONGO_URI` and a long random `SESSION_SECRET`.
2. Optional email notifications: configure `EMAIL_USER` and `EMAIL_PASS` in `backend/.env`. If they are blank, the application still works; email sending is skipped/logged.
3. In a terminal:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. In another terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Create the first admin

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`, then run:

```bash
cd backend
npm run seed:admin
```

Never allow public admin registration. Patients and doctors can register from the UI; doctor accounts remain pending until approved by the admin.

## Important migration notes

- Original uploaded assets are copied into `backend/public/images/hospitals/` and served from `/images/hospitals/...`.
- The old `.env` file was intentionally not copied into the new project, to avoid exposing secrets. Use `.env.example` instead.
- Existing Mongoose collections and model names are retained (`User`, `Appointment`, `Package`, `Enquiry`) and their key fields are preserved. Keep a backup of your MongoDB database before running against real data.
- The original appointment OTP was generated and printed to the terminal rather than sent by SMS. This migration keeps that development behavior and does not claim real SMS delivery.
- This code has been statically checked for syntax and route consistency, but cannot be fully end-to-end tested without your MongoDB URI, mail credentials, and local environment. Test with a development database first; do not use real patient data until you complete a privacy/security review.


## Modular structure notes

- `frontend/src/App.jsx` delegates to `routes/AppRoutes.jsx`; individual pages live in `pages/`.
- Shared layout/auth helpers live in `components/shared.jsx`.
- `backend/controllers/` contains a controller file per action, grouped by feature.
- `backend/routes/` contains separate feature routers and `index.js` mounts them.
- `backend/routes/apiRoutes.js` remains as a compatibility alias to `routes/index.js`.
- Do not commit `.env`; copy `.env.example` to `.env` and set your own local credentials.


## Added integration: hospitals, careers and Razorpay

1. Copy `backend/.env.example` to `backend/.env` and fill in your own MongoDB URI and secrets. Do not share real `.env` credentials.
2. In `backend`, run `npm install`, then `npm run seed:hospitals` once to add the initial hospital records.
3. Add Razorpay **test** credentials as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`. Without these values, the payment button reports that Razorpay is not configured.
4. Start backend (`npm run dev`) and frontend (`npm run dev` in `frontend`).
5. Hospital CRUD is available to logged-in admins in Admin Dashboard → Hospitals. Public pages use the `/api/hospitals` and `/api/locations` endpoints.
6. Career applications are saved in MongoDB. Resume files are stored under `backend/uploads/resumes` and are only downloadable through the admin-protected route. Back up this folder with your database.
7. Appointment payment creates a Razorpay order on the server and confirms the appointment only after HMAC signature verification. Test with Razorpay test mode before using live keys.

The uploaded archive's original `.env` was intentionally not included in the output archive for credential safety; configure your local values from `.env.example`.
