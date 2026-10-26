# TimeBank Learn — Skill Exchange Platform

> **IEEE Std 830-1998 Compliant Specification**  
> **Course:** Full Stack Application Development with ReactJS & Node.js  
> **Prepared by:** Pranav Krishna PB  
> **Institution:** Sahrdaya College of Engineering & Technology  
> **Curriculum:** ICT Academy of Kerala  

---

## 1. Project Overview

**TimeBank Learn** is a modern MERN-stack web application where community members exchange skills using **time credits** instead of money:
- **1 hour of teaching = 1 credit**, regardless of the skill.
- New members automatically receive **2 free credits** upon registration so they can learn before they teach (C-2, FR-1.1).
- Safe hold-and-release escrow flow: credits are deducted into a hold status when a request is accepted, and released to the teacher only after **both teacher and learner confirm session completion** (BR-2, BR-3, FR-3.7).
- Backed by an immutable **append-only credit ledger** (`CreditTransaction`) guaranteeing balances never go below zero (BR-7, FR-4.1).

---

## 2. Technology Stack & Architecture

| Layer | Choice & Responsibility |
|---|---|
| **Frontend** | React (Vite), React Router v6, Context API for state & auth, Lucide Icons, Vanilla CSS design system tokens. |
| **Backend** | Node.js & Express REST API, CORS, Morgan logger, stateless JWT session tokens, Bcrypt password hashing. |
| **Database** | MongoDB Atlas via Mongoose ODM (with automatic embedded in-memory MongoDB fallback for instant zero-dependency local testing). |
| **Security** | Central error handler (NFR-3.6), server-side input validation, NoSQL injection protection (NFR-2.5), role-based route guards. |

---

## 3. Demo Credentials

The platform includes pre-seeded demo accounts with diverse skill listings, active bookings, session histories, reviews, and ledger records:

| Role | Name | Email | Password | Available Credits |
|---|---|---|---|---|
| **Platform Administrator** | System Admin | `admin@timebank.org` | `Password123!` | 10 |
| **Teacher** | Rahul Varma | `rahul@example.com` | `Password123!` | 4 |
| **Teacher** | Ananya Nair | `ananya@example.com` | `Password123!` | 3 |
| **Teacher** | Alex Chen | `alex@example.com` | `Password123!` | 2 |
| **Learner** | Sneha Thomas | `sneha@example.com` | `Password123!` | 2 |

*(Tip: In the web UI, use the **"Quick Demo"** button on the navbar or login screen to switch between these profiles with a single click!)*

---

## 4. Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation & Run

1. **Clone the repository:**
   ```bash
   cd TIMEbank
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install server dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

5. **Start Both Server & Client:**
   ```bash
   npm run dev
   ```
   - **Frontend App:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Note on Database: By default, the backend connects to an embedded in-memory MongoDB instance with auto-seeded demo data so it works immediately without external setup. To connect to your cloud cluster, set `MONGODB_URI=mongodb+srv://...` in `server/.env`.)*

---

## 5. Core Business Rules Implemented

- **BR-1:** A learner can request a session only if their available balance is at least the session length in credits.
- **BR-2:** When a teacher accepts a request, credits are deducted from learner available balance and placed on hold.
- **BR-3:** Credits are released to the teacher only when both teacher and learner confirm completion.
- **BR-4:** If a session is cancelled before it starts, held credits return to the learner.
- **BR-5:** If participants report a conflict, the session is flagged as `Disputed` and credits stay in escrow pending admin review.
- **BR-6:** A member cannot request a session on their own listing.
- **BR-7:** Available balance can never go below zero.

---

## 6. API Contract

### Authentication & Profile
- `POST /api/auth/register` — Create account (grants 2 starter credits, hashes password, returns JWT).
- `POST /api/auth/login` — Log in with email & password.
- `GET /api/users/me` — Current profile and credit balance.
- `PATCH /api/users/me` — Update name, bio, location, photo URL.
- `POST /api/users/change-password` — Change password.
- `GET /api/users/:id/public` — Teacher public stats and reviews.

### Skill Listings
- `GET /api/listings` — Search listings with keyword, category, mode filters, and pagination.
- `POST /api/listings` — Create new skill listing (1 or 2 hours duration).
- `GET /api/listings/:id` — Detail view of a skill listing.
- `PATCH /api/listings/:id` — Edit listing or toggle active/paused.
- `DELETE /api/listings/:id` — Delete listing.
- `GET /api/listings/my/all` — Get current user's listings.

### Sessions & Lifecycle
- `POST /api/sessions` — Propose/book a session with date/time and message.
- `GET /api/sessions/inbox` — Incoming (as teacher) and Outgoing (as learner) requests.
- `GET /api/sessions/my` — User's active and completed sessions.
- `PATCH /api/sessions/:id/accept` — Teacher accepts (holds credits).
- `PATCH /api/sessions/:id/decline` — Teacher declines (no credits moved).
- `PATCH /api/sessions/:id/cancel` — Cancel session (refunds held credits).
- `PATCH /api/sessions/:id/confirm` — Two-sided confirmation (releases credits upon second confirmation).
- `PATCH /api/sessions/:id/dispute` — Report dispute (freezes credits in hold).
- `POST /api/sessions/:id/review` — Learner submits 1-5 star review for completed session.

### Credit Ledger
- `GET /api/credits/history` — Balance overview and paginated append-only ledger history.

### Admin Moderation & Governance
- `GET /api/admin/users` — List platform users.
- `PATCH /api/admin/users/:id/suspend` — Suspend or reinstate user.
- `GET /api/admin/listings` — Moderation view of all listings.
- `PATCH /api/admin/listings/:id/moderate` — Unpublish/publish listings.
- `GET /api/admin/sessions/disputed` — List disputed sessions.
- `PATCH /api/admin/sessions/:id/resolve` — Resolve dispute (refund learner or release to teacher).
- `GET /api/admin/logs` — Immutable audit log trail.

---

## 7. Submission Checklist & Verification

- [x] Full Stack MERN Architecture (React, Express, Node.js, MongoDB/Mongoose).
- [x] IEEE Std 830-1998 format requirements implemented.
- [x] 4 UI states handled across all views: Loading, Success, Empty, Error.
- [x] Mobile-first responsive design tested across breakpoints.
- [x] Append-only ledger model and escrow credit lifecycle verified.
- [x] 1-Click demo switcher for examiners and supervisors.
