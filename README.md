# MediTrac (React + Vite)

This is the React port of the MediTrac static prototype. Functionally it's the same app — same `localStorage` data model, same pages — just restructured into components/routes instead of separate HTML files with inline `<script>` blocks.

## What changed vs. the static version

- **Routing**: `index.html` / `register.html` / `user-dashboard.html` / `pharmacy-dashboard.html` are now routes (`/`, `/register`, `/dashboard/user`, `/dashboard/pharmacy`) via `react-router-dom`, rendered by a single `index.html` entry point.
- **Components**: shared UI (navbar, medicine cards, pharmacy option rows, the add-medication modal, the two Leaflet maps) are now reusable components under `src/components/`.
- **State**: DOM manipulation (`getElementById`, `innerHTML`) is replaced with React state/props. All the `localStorage` keys and shapes are **unchanged** — `meditrac_accounts`, `meditrac_session`, `meditrac_medications`, `meditrac_tracked_<email>` — so nothing about how data is stored is different, only how it's read/rendered.
- **Leaflet**: still plain `leaflet`, wired up via `useRef`/`useEffect` (not `react-leaflet`) since that's the most direct, testable port of the original map logic.
- **Build tooling**: this now needs a build step (Vite) — run `npm run dev` instead of opening an `.html` file directly.

## Getting Started

```bash
npm install
npm run dev
```

Then visit the printed local URL (typically `http://localhost:5173`).

To produce a production build:

```bash
npm run build
npm run preview   # serve the built dist/ folder locally to sanity check it
```

## Project Structure

```
meditrac-react/
├── index.html                  # Vite entry point (single page for the whole app)
├── public/
│   └── logos/                  # Put your logo/icon assets here (not included in this port)
├── src/
│   ├── main.jsx                 # App bootstrap + BrowserRouter
│   ├── App.jsx                  # Route definitions
│   ├── index.css                # Imports the global stylesheet
│   ├── pages/
│   │   ├── HomePage.jsx             # was index.html
│   │   ├── RegisterPage.jsx         # was register.html
│   │   ├── UserDashboardPage.jsx    # was user-dashboard.html
│   │   └── PharmacyDashboardPage.jsx # was pharmacy-dashboard.html
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── PharmacyLocationPicker.jsx  # Leaflet pin-picker used at pharmacy sign-up
│   │   ├── ResultsMap.jsx              # Leaflet results map on the patient dashboard
│   │   └── AddMedicationModal.jsx
│   ├── utils/
│   │   ├── accounts.js          # accounts/session localStorage helpers
│   │   ├── medications.js       # medications/tracked-ids localStorage helpers
│   │   ├── geo.js                # haversine distance + escapeHtml (for Leaflet popups)
│   │   └── useGeolocation.js    # browser geolocation hook
│   └── styles/                  # the original CSS files, ported as-is (plus the rules
│                                   that used to live in inline <style> blocks)
```


- Same as the static version: data lives in `localStorage`, so it's per-browser. A pharmacy's inventory won't show up for a patient in a different browser/device — see the static README's Roadmap for when a real backend gets reintroduced.
- Only pharmacies registered through this app have map coordinates (`latitude`/`longitude` on their account). Any pre-existing test accounts created before the map feature won't have a pin or a distance — they'll just show "Distance unknown" and sort after the pharmacies that do.
