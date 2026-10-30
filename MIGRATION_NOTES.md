# Migration coverage checklist

- [x] Patient registration and login
- [x] Doctor registration with specialty/experience and pending approval
- [x] Admin dashboard, doctor approval/rejection, patient/doctor management
- [x] Appointment request form and OTP verification flow
- [x] Patient appointment history/cancellation
- [x] Doctor assigned-appointment status changes
- [x] MongoDB health packages listing/detail/search/category/gender filters
- [x] Home enquiry persistence and optional email notification
- [x] Wellness/hospital location cards with uploaded images
- [x] Careers page and role enquiry links
- [x] Same top-level frontend/backend structure as the MediSlot starter

The original app only logged appointment OTPs in the server terminal (it did not actually send SMS). That behavior is retained for local development. The old EJS routes are replaced by API endpoints and React Router pages; the key database model names/fields are retained.
