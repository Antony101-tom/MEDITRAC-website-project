// Accounts/medications stay in localStorage — they represent shared data,
// same as before. The session is the one thing that should be per-tab (so
// you can be logged in as a pharmacy in one tab and a patient in another,
// side by side, in the same regular browser window) — sessionStorage gives
// each tab its own isolated copy instead of sharing one login across all of
// them the way localStorage would.
const ACCOUNTS_KEY = 'meditrac_accounts';
const SESSION_KEY = 'meditrac_session';

export function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const accounts = raw ? JSON.parse(raw) : [];
    // Accounts created before this change may still carry the retired
    // `location` text field (Estate / Physical Location). Drop it on read
    // so stale data can't conflict with the new lat/lng-only flow.
    return accounts.map(({ location, ...rest }) => rest);
  } catch (e) {
    console.warn('Could not read accounts database.', e);
    return [];
  }
}

export function saveAccounts(list) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

export function findAccount(accounts, type, email) {
  return accounts.find((a) => a.type === type && a.email === email) || null;
}

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(account) {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ type: account.type, name: account.name, email: account.email })
  );
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function updateAccountCoords(type, email, lat, lng) {
  const accounts = loadAccounts();
  const idx = accounts.findIndex((a) => a.type === type && a.email === email);
  if (idx === -1) return null;
  const updated = { ...accounts[idx], latitude: lat, longitude: lng };
  accounts[idx] = updated;
  saveAccounts(accounts);
  return updated;
}

export function loadPharmacyCoords() {
  const coords = new Map();
  loadAccounts()
    .filter((a) => a.type === 'pharmacy' && typeof a.latitude === 'number' && typeof a.longitude === 'number')
    .forEach((a) => coords.set(a.name, { lat: a.latitude, lng: a.longitude }));
  return coords;
}
