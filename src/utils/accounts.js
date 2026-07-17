// Same localStorage-backed "database" the static prototype used — kept
// exactly as-is on purpose so any data created by the old site still works.
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
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(account) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ type: account.type, name: account.name, email: account.email })
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
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
