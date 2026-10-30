# CarePlus integration and test report

## Implemented
- Hospital records are read from MongoDB for `/api/hospitals` and `/api/locations`.
- Admin-only hospital create, update, and delete endpoints and dashboard UI.
- Home callback hospital dropdown and hospital count use API data; hospital listing page uses database locations.
- Public doctor cards/search now query approved doctor accounts in MongoDB and no longer append arbitrary legacy `doctors` collection documents as verified.
- Career form sends multipart form data; backend validates and stores PDF/DOC/DOCX resume uploads up to 5 MB. Admin can list applications, update status, and download resume through an admin-protected endpoint.
- Appointment Razorpay order creation and signature verification. Appointment is confirmed only after successful server-side signature verification.
- Hospital seed script and `.env.example` added.

## Checks performed in this environment
- `node --check` passed for all backend JavaScript files.
- Frontend JavaScript/JSX transpilation syntax check passed for 17 source files.
- Backend API route modules loaded successfully.
- Multipart resume parser was exercised with a sample PDF upload and parsed text fields plus file metadata successfully.

## Checks not completed
- Full Vite production build could not run in this Linux test environment because the uploaded `node_modules` did not contain Rollup's Linux native optional package (`@rollup/rollup-linux-x64-gnu`). The source syntax check passed, but this is not a successful production-build test.
- A live MongoDB integration test and real Razorpay checkout were not run because they require your own database and Razorpay credentials.

## Before running locally
1. Copy `backend/.env.example` to `backend/.env` and fill in your own credentials.
2. Run `npm install` in both `backend` and `frontend`.
3. In `backend`, run `npm run seed:hospitals` once.
4. Add Razorpay test key ID and secret to `backend/.env` before testing payments.
5. Start backend and frontend separately. Test Razorpay in test mode first.
