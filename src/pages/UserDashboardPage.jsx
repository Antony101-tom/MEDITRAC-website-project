import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResultsMap from '../components/ResultsMap';
import { getSession, loadPharmacyCoords } from '../utils/accounts';
import {
  loadAllMedications,
  loadTrackedIds,
  saveTrackedIds,
  trackedKeyFor,
  LOW_STOCK_THRESHOLD,
} from '../utils/medications';
import { haversineKm } from '../utils/geo';
import useGeolocation from '../utils/useGeolocation';
import '../styles/user-dashboard.css';

function formatBranch(branch) {
  const b = (branch || '').trim();
  return b ? b : 'Branch not specified by pharmacy';
}

export default function UserDashboardPage() {
  const [searchParams] = useSearchParams();
  useEffect(() => { document.title = 'Patient Portal - Meditrac'; }, []);
  const session = getSession();
  const name = searchParams.get('name') || (session && session.type === 'user' ? session.name : null);
  const trackedKey = trackedKeyFor(session);
  const userLoc = useGeolocation();

  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  // Bumping this forces medications/tracked-ids to be re-read from
  // localStorage after a track/untrack action, same as the vanilla
  // re-render-after-write pattern.
  const [refreshTick, setRefreshTick] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshTick is a deliberate cache-buster, not a real dependency
  const medications = useMemo(() => loadAllMedications(), [refreshTick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- same as above
  const trackedIds = useMemo(() => loadTrackedIds(trackedKey), [trackedKey, refreshTick]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  function trackMedication(id) {
    const ids = loadTrackedIds(trackedKey);
    if (!ids.includes(id)) {
      ids.push(id);
      saveTrackedIds(trackedKey, ids);
    }
    const med = medications.find((m) => m.id === id);
    showToast(med ? `${med.name} added to your trackers.` : 'Added to your trackers.');
    setRefreshTick((t) => t + 1);
  }

  function untrackMedication(id) {
    const ids = loadTrackedIds(trackedKey).filter((x) => x !== id);
    saveTrackedIds(trackedKey, ids);
    setRefreshTick((t) => t + 1);
  }

  const trackedMeds = trackedIds.map((id) => medications.find((m) => m.id === id)).filter(Boolean);

  const uniquePharmacies = new Set(trackedMeds.map((m) => m.pharmacy));
  const networkPharmacies = new Set(medications.map((m) => m.pharmacy));

  const isSearching = query.trim() !== '';

  // Derived search results: matches annotated with distance, grouped by drug
  // name, each group sorted nearest-first (falling back to cheapest-first
  // when distance isn't known), plus a per-pharmacy map dataset.
  const { groups, byPharmacy } = useMemo(() => {
    if (!isSearching) return { groups: [], byPharmacy: new Map() };

    const q = query.trim().toLowerCase();
    const matches = medications.filter(
      (med) => (med.name || '').toLowerCase().includes(q) || (med.category || '').toLowerCase().includes(q)
    );

    const pharmacyCoords = loadPharmacyCoords();
    matches.forEach((med) => {
      med._coords = pharmacyCoords.get(med.pharmacy) || null;
      med._distanceKm =
        userLoc && med._coords ? haversineKm(userLoc.lat, userLoc.lng, med._coords.lat, med._coords.lng) : null;
    });

    const groupMap = new Map();
    matches.forEach((med) => {
      const key = (med.name || '').trim().toLowerCase();
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key).push(med);
    });

    const groups = Array.from(groupMap.values()).map((group) => {
      const withDist = group.filter((m) => m._distanceKm !== null).sort((a, b) => a._distanceKm - b._distanceKm);
      const withoutDist = group.filter((m) => m._distanceKm === null).sort((a, b) => Number(a.price) - Number(b.price));
      return [...withDist, ...withoutDist];
    });

    const byPharmacy = new Map();
    matches.forEach((med) => {
      if (!med._coords) return;
      if (!byPharmacy.has(med.pharmacy)) {
        byPharmacy.set(med.pharmacy, { coords: med._coords, distanceKm: med._distanceKm, meds: [] });
      }
      byPharmacy.get(med.pharmacy).meds.push(med);
    });

    return { groups, byPharmacy };
  }, [isSearching, query, medications, userLoc]);

  return (
    <>
      <Navbar variant="dashboard" title="Patient Dashboard" status="Account Verified" statusColor="#48bb78" />

      <div className="dashboard-container">
        <aside className="sidebar">
          <a href="#" className="sidebar-link active"> Find Medicine</a>
          <a href="#" className="sidebar-link"> My Prescriptions</a>
          <hr style={{ border: 0, borderTop: '1px solid #edf2f7', margin: '15px 0' }} />
        </aside>

        <main className="main-content">
          <div className="welcome-banner">
            <h1>{name ? `Welcome back, ${name}!` : 'Welcome back, Patient!'}</h1>
            <p>Run real-time stock searches across verified partner chemists in your estate line instantly.</p>
          </div>

          <div className="metrics-grid">
            <div className="u-card">
              <span>Active Trackers</span>
              <h3>{trackedMeds.length}</h3>
              <p>{trackedMeds.length === 0 ? 'No medicine tracked yet' : 'Updated just now'}</p>
            </div>
            <div className="u-card">
              <span>Saved Chemists</span>
              <h3>{uniquePharmacies.size}</h3>
              <p style={{ color: '#2b6cb0' }}>From your tracked medicine</p>
            </div>
            <div className="u-card">
              <span>Partner Network</span>
              <h3>{networkPharmacies.size}</h3>
              <p>Pharmacies live on Meditrac</p>
            </div>
          </div>

          <div className="search-hero-panel">
            <h3>Track Medicine Availability On-Demand</h3>
            <div className="input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setQuery(inputValue); }}
                placeholder="Type drug name here (e.g., Insulin Lantus, Amoxicillin, Ventolin)..."
              />
              <button className="search-cta" onClick={() => setQuery(inputValue)}>Locate Stock Now</button>
            </div>
          </div>

          {isSearching && byPharmacy.size > 0 && (
            <div className="panel" style={{ marginBottom: '35px' }}>
              <div className="panel-header">
                <h3>Nearby Pharmacies</h3>
                <small style={{ color: '#718096', fontSize: '0.8rem' }}>
                  {userLoc ? 'Pins sorted by distance from your current location' : 'Allow location access in your browser to sort by distance'}
                </small>
              </div>
              <ResultsMap byPharmacy={byPharmacy} userLoc={userLoc} onTrack={trackMedication} />
            </div>
          )}

          <div className="feed-heading">
            <h3>{isSearching ? `Search Results for "${query}"` : 'Your Active Medicine Trackers'}</h3>
            {isSearching && (
              <small className="clear-search-link" onClick={() => { setInputValue(''); setQuery(''); }}>Clear search</small>
            )}
          </div>

          <div className="live-grid">
            {!isSearching && trackedMeds.length === 0 && (
              <div className="empty-state">
                <strong>You aren't tracking any medicine yet</strong>
                Search for a drug above and hit "Track" on a pharmacy's listing to follow its availability here.
              </div>
            )}

            {!isSearching &&
              trackedMeds.map((med) => {
                const isLow = Number(med.quantity) <= LOW_STOCK_THRESHOLD;
                const accent = isLow ? '#dd6b20' : '#2b6cb0';
                const note =
                  med.quantity <= 0
                    ? 'Out of stock'
                    : isLow
                    ? `Only ${med.quantity} ${med.unit || 'units'} remaining`
                    : `${med.quantity} ${med.unit || 'units'} in stock`;
                return (
                  <div className="med-card" key={med.id} style={{ borderTop: `4px solid ${accent}` }}>
                    <div className="med-meta">
                      <div className="med-title">
                        <h4>{med.name}</h4>
                        <span>{med.category || ''}{med.form ? ` • ${med.form}` : ''}</span>
                      </div>
                    </div>
                    <p className="pharmacy-detail">
                      {note} at <strong>{med.pharmacy}</strong>. Pricing logged at KES {Number(med.price).toLocaleString()} per{' '}
                      {(med.unit || 'unit').toLowerCase().replace(/s$/, '')}.
                    </p>
                    <div className="location-tag"> {formatBranch(med.branch)}</div>
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                      <button className="untrack-btn" onClick={() => untrackMedication(med.id)}>Stop Tracking</button>
                    </div>
                  </div>
                );
              })}

            {isSearching && groups.length === 0 && (
              <div className="empty-state">
                <strong>"{query}" is unavailable</strong>
                None of our partner pharmacies currently list this medicine. Try a different name, or check back later.
              </div>
            )}

            {isSearching &&
              groups.map((group) => {
                const first = group[0];
                const anyLow = group.some((m) => Number(m.quantity) <= LOW_STOCK_THRESHOLD && Number(m.quantity) > 0);
                const accent = anyLow ? '#dd6b20' : '#2b6cb0';
                const sortLabel = group.some((m) => m._distanceKm !== null) ? 'sorted by distance' : 'sorted by lowest price';

                return (
                  <div className="med-card" key={first.name} style={{ borderTop: `4px solid ${accent}` }}>
                    <div className="med-meta">
                      <div className="med-title">
                        <h4>{first.name}</h4>
                        <span>{first.category || ''}{first.form ? ` • ${first.form}` : ''}</span>
                      </div>
                    </div>
                    {group.length > 1 && (
                      <div className="multi-pharmacy-note">Available at {group.length} partner pharmacies — {sortLabel}</div>
                    )}
                    <div className="pharmacy-options">
                      {group.map((med) => {
                        const isLow = Number(med.quantity) <= LOW_STOCK_THRESHOLD;
                        const tracked = trackedIds.includes(med.id);
                        return (
                          <div className="pharmacy-option" key={med.id}>
                            <div className="po-info">
                              <strong>{med.pharmacy}</strong>
                              <span className="po-sub">{formatBranch(med.branch)}</span>
                              {med._distanceKm !== null && <span className="po-sub">{med._distanceKm.toFixed(1)} km away</span>}
                            </div>
                            <div className={`po-stock ${isLow ? 'low' : ''}`}>
                              {med.quantity > 0
                                ? `${isLow ? 'Low Stock' : 'In Stock'} • ${med.quantity} ${med.unit || 'units'} left`
                                : 'Out of Stock'}{' '}
                              — KES {Number(med.price).toLocaleString()}
                            </div>
                            <button
                              className={`track-btn ${tracked ? 'tracked' : ''}`}
                              disabled={tracked}
                              onClick={() => trackMedication(med.id)}
                            >
                              {tracked ? '✓ Tracked' : 'Track'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </main>
      </div>

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </>
  );
}
