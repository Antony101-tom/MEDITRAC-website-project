# MediTrac — Medicine Availability Tracker

## Problem

Patients across Kenya routinely waste time and resources trying to find medicine. There is no price transparency between pharmacies, critical treatment delays occur when a needed drug is out of stock, and people end up "pharmacy hopping" — calling pharmacies one by one or asking around in WhatsApp groups, with no central way to check stock or prices.

## Solution

MediTrac gives real-time, searchable visibility into medicine availability and pricing across partner pharmacies:

- **Real-time search & API integration** — query live stock and price data instead of calling around.
- **Map-based results** — see nearby pharmacies that actually have the medicine in stock.
- **Live stock updates** — pharmacy inventories sync regularly so results stay accurate.

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
- API maintenance
- Marketing
- Compliance/legal fees for health data privacy

## Key Metrics

- Daily / monthly active users
- Search success rate (% of searches resolving to in-stock medicine)
- Pharmacy/partner growth

## Trust & Safety: Counterfeit Medicine

A key open question for the platform: **how do we ensure no counterfeit medicine is tracked or sold through MediTrac?** Planned safeguards include:

- Only onboarding verified, licensed pharmacies as data partners (no unverified/individual listings).
- Pulling stock and pricing data from pharmacy inventory systems rather than allowing manual/self-reported listings.
- Periodic verification/audit of partner pharmacy licenses.
- MediTrac displays availability and connects users to licensed pharmacies — it does not process medicine sales directly, which limits exposure to counterfeit transactions but still requires partner vetting.

This is an area we'll keep iterating on as the platform grows (see Roadmap).

---

## How It Works

1. A user searches for a medicine by name on the homepage.
2. The frontend calls the backend API (`/api/medications`).
3. The backend queries the `drug_availability` view, which joins `drug`, `inventory`, `pharmacy`, and `location` to return matching drugs, which pharmacies stock them, current price, quantity, and stock status.
4. Results are shown to the user so they can see availability, price, and pharmacy location before traveling.

## Tech Stack

- **Backend:** Node.js, Express 5
- **Database:** PostgreSQL (via `pg`) — schema also includes an `mssql` dependency, kept available in case of a SQL Server integration
- **Config:** `dotenv` for environment variables
- **Frontend:** Static HTML/CSS (vanilla)

## Project Structure

```
MEDITRAC-website-project/
├── config/
│   └── db.js                       # Database connection setup
├── routes/
│   └── medication.js               # /api/medications route handlers
├── logos/                          # Site images/icons (logo, favicon, benefit icons)
├── index.html                      # Landing page (search, benefits, about us)
├── style.css                       # Styles for index.html
├── template.html                   # Base page template
├── template.css                    # Styles for template.html
├── drug_availability_schema.sql    # PostgreSQL schema: drug, pharmacy, location, inventory + view
├── server.js                       # Express app entry point
├── package.json
├── package-lock.json
└── README.md
```

### Database Schema Overview

- **drug** — drug name, generic name, manufacturer, dosage form, strength, category.
- **pharmacy** — registered pharmacies (name, phone, email, operating hours).
- **location** — one address + lat/long per pharmacy, for map-based search.
- **inventory** — links a drug to a pharmacy with quantity, price, and status (`in_stock`, `low_stock`, `out_of_stock`).
- **drug_availability** (view) — joins all four tables for easy "search drug → see pharmacies & stock" queries.

Indexes are set up on drug name/generic name/category, location city/region/coordinates, and inventory status/drug/pharmacy for fast search.

## Getting Started

1. Clone the repo:
   ```
   git clone https://github.com/Antony101-tom/MEDITRAC-website-project.git
   cd MEDITRAC-website-project
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set up a PostgreSQL database and run `drug_availability_schema.sql` against it.
4. Create a `.env` file in the project root with your database connection details, e.g.:
   ```
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/meditrac
   ```
5. Start the server:
   ```
   node server.js
   ```
6. Visit `http://localhost:5000` to confirm the backend is running, and open `index.html` (e.g. via Live Server) for the frontend.

## API

| Method | Endpoint              | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/`                    | Health check — confirms server is up |
| GET    | `/api/medications`     | Medication search/availability data  |

*(Expand this table as more routes are added to `routes/medication.js`.)*

## Roadmap

- [ ] Connect frontend search bar to `/api/medications` endpoint
- [ ] Finalize pharmacy partner onboarding & API integration
- [ ] Implement map-based search UI using `location` lat/long data
- [ ] Build pharmacy verification process (counterfeit prevention)
- [ ] Add premium "back-in-stock" alert subscriptions
- [ ] Launch in a pilot area (local clinics + community outreach)
- [ ] Expand partner pharmacy network
- [ ] Add data insights dashboard for partners

## License

*(License Details.)*
