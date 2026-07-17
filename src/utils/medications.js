const STORAGE_KEY = 'meditrac_medications';
export const LOW_STOCK_THRESHOLD = 5;

export function loadAllMedications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Could not read medication database.', e);
    return [];
  }
}

export function saveMedications(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function trackedKeyFor(session) {
  return 'meditrac_tracked_' + (session && session.type === 'user' && session.email ? session.email : 'guest');
}

export function loadTrackedIds(trackedKey) {
  try {
    const raw = localStorage.getItem(trackedKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTrackedIds(trackedKey, ids) {
  localStorage.setItem(trackedKey, JSON.stringify(ids));
}
