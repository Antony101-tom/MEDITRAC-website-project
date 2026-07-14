# MediTrac — Medicine Availability Tracker

## Problem

Patients across Kenya routinely waste time and resources trying to find medicine. There is no price transparency between pharmacies, critical treatment delays occur when a needed drug is out of stock, and people end up "pharmacy hopping" — calling pharmacies one by one or asking around in WhatsApp groups, with no central way to check stock or prices.

## Solution

MediTrac gives real-time, searchable visibility into medicine availability and pricing across partner pharmacies:

- **Search & compare** — search a drug and see every partner pharmacy that stocks it, sorted by price.
- **Pharmacy self-service** — pharmacies manage their own shelf inventory (add medications, update stock levels) from their own dashboard.
- **Patient tracking** — patients can "track" a medicine/pharmacy combo and see it surfaced on their dashboard.

## Unique Value Proposition

**"Don't travel blind."** MediTrac is "Google Maps for medicine" — fast, location-aware access to where a medicine is actually available, instead of guessing or visiting pharmacies one at a time.

## Unfair Advantage

- Pharmacy partnerships and exclusive API access to pharmacy inventory systems.
- First-mover advantage in building a structured medicine-availability data layer for the region.

## Customer Segments

- Chronic patients managing ongoing prescriptions
- Caregivers
- Busy professionals
- Parents of young children

**Early adopters:** people managing chronic conditions who need monthly refills, and parents of young children.

## Channels

- Local clinics and hospitals
- Social media health communities
- SEO ("is [Drug] in stock?" search intent)

## Revenue Streams

- Subscriptions
- Referral fees
- Premium alerts (notify me when a medicine is back in stock)
- Data insights (aggregated, anonymized demand/availability trends sold to partners)

## Cost Structure

- Cloud hosting
- Marketing
- Compliance/legal fees for health data privacy

## Key Metrics

- Daily / monthly active users
- Search success rate (% of searches resolving to in-stock medicine)
- Pharmacy/partner growth

## Trust & Safety: Counterfeit Medicine

A key open question for the platform: **how do we ensure no counterfeit medicine is tracked or sold through MediTrac?** Planned safeguards include:

- Only onboarding verified, licensed pharmacies as data partners (no unverified/individual listings).
- Periodic verification/audit of partner pharmacy licenses.
- MediTrac displays availability and connects users to licensed pharmacies — it does not process medicine sales directly, which limits exposure to counterfeit transactions but still requires partner vetting.

This is an area we'll keep iterating on as the platform grows (see Roadmap).

---

## Current Status: Frontend Prototype (no backend yet)

This build is a **static, frontend-only prototype**. There is no server and no database right now — everything (accounts, sessions, and the medication inventory) is stored in the browser's `localStorage`. This is intentional at this stage: it lets the full user flow (register → log in → manage/search stock) be demoed and tested without standing up a backend.

> A previous version of this project had a partially-wired Postgres + Express backend (`server.js`, SQL schema files, `/api/medications` route) alongside this localStorage prototype, and `login.html` was calling that backend directly. That created two conflicting sources of truth — a real login page hitting a database that had no matching accounts, and a register page writing to `localStorage` that the login page never read from. That backend layer has been removed for now so there is a single, working, self-consistent app. It can be reintroduced later (see Roadmap) once the localStorage data model is stable and worth persisting server-side.

### How It Works

1. A user (patient or pharmacy) visits `register.html`, picks an account type, and either signs up or logs in. Both actions read/write a `meditrac_accounts` list and a `meditrac_session` object in `localStorage`.
2. On success, they're redirected to `user-dashboard.html` or `pharmacy-dashboard.html` depending on account type.
3. Pharmacies add/update medications on their dashboard, stored under the shared `meditrac_medications` key in `localStorage`, scoped to that pharmacy's name.
4. Patients search `meditrac_medications` on their dashboard, see matching drugs across pharmacies sorted by price, and can "track" specific listings (stored per-patient under `meditrac_tracked_<email>`).
5. "Log Out" clears `meditrac_session` and returns to the homepage.

### Tech Stack

- **Frontend:** Static HTML/CSS/vanilla JS
- **"Database":** Browser `localStorage` (no server, no persistence beyond the browser/device)

### Project Structure

```
MEDITRAC-website-project/
├── logos/                    # Site images/icons (logo, favicon, benefit icons)
├── index.html                # Landing page (search, benefits, about us)
├── style.css                 # Shared site styles
├── register.html             # Single entry point for sign up AND log in (user + pharmacy)
├── register.css              # Register page styles
├── user-dashboard.html       # Patient dashboard: search + track medicine
├── user-dashboard.css
├── pharmacy-dashboard.html   # Pharmacy dashboard: manage shelf inventory
├── pharmacy.css
└── README.md
```

### `localStorage` Keys

| Key | Shape | Purpose |
|---|---|---|
| `meditrac_accounts` | `Array<{id, type, name, email, location, password, createdAt}>` | All registered accounts (user + pharmacy) |
| `meditrac_session` | `{type, name, email}` | Currently logged-in account |
| `meditrac_medications` | `Array<{id, name, form, category, quantity, unit, price, pharmacy, branch}>` | All medications across all pharmacies |
| `meditrac_tracked_<email>` | `Array<string>` (medication ids) | A patient's tracked listings (falls back to `meditrac_tracked_guest` if not logged in) |

## Getting Started

No install or build step needed:

1. Clone the repo:
   ```
   git clone https://github.com/Antony101-tom/MEDITRAC-website-project.git
   cd MEDITRAC-website-project
   ```
2. Open `index.html` directly in a browser, or serve the folder with any static server (e.g. VS Code Live Server) so relative paths resolve cleanly.
3. Register a pharmacy account, add some medications, then register a patient account and search for them.

Note: since data lives in `localStorage`, it's per-browser — a pharmacy's inventory added in one browser won't show up for a patient searching in a different browser/device. That's the main limitation a real backend would solve (see Roadmap).

## Roadmap

- [ ] Reintroduce a real backend (Express + Postgres) once the localStorage data model is finalized, so data isn't per-browser
- [ ] Wire `register.html` / dashboards to backend API routes instead of `localStorage`
- [ ] Implement map-based search UI using pharmacy location data
- [ ] Build pharmacy verification process (counterfeit prevention)
- [ ] Add premium "back-in-stock" alert subscriptions
- [ ] Launch in a pilot area (local clinics + community outreach)
- [ ] Expand partner pharmacy network
- [ ] Add data insights dashboard for partners

## License

*(License Details.)*
