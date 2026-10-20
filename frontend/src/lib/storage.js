// Garden management tokens grant full access. Never include them in recipient codes.
const MANAGED_GARDENS_KEY = "letter_for_you_managed_gardens_v1";
const OPENED_VAULT_KEY = "opened_vault";

function readManagedGardens() {
  try {
    const data = JSON.parse(localStorage.getItem(MANAGED_GARDENS_KEY) || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

export function getManagedGardenIds() {
  return Object.keys(readManagedGardens());
}

export function getGardenKey(vaultId) {
  return readManagedGardens()[vaultId] || null;
}

export function saveGardenKey(vaultId, key) {
  if (!/^[a-f0-9]{64}$/.test(key)) {
    throw new Error("Invalid management key format");
  }
  const gardens = readManagedGardens();
  gardens[vaultId] = key;
  localStorage.setItem(MANAGED_GARDENS_KEY, JSON.stringify(gardens));
}

export function forgetGarden(vaultId) {
  const gardens = readManagedGardens();
  delete gardens[vaultId];
  localStorage.setItem(MANAGED_GARDENS_KEY, JSON.stringify(gardens));
}

export function getManagementLink(vaultId) {
  const key = getGardenKey(vaultId);
  if (!key) return null;
  return `${window.location.origin}/vaults/${encodeURIComponent(vaultId)}#manage=${key}`;
}

export function importManagementLink(vaultId) {
  const hash = window.location.hash;
  const key = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash).get("manage");
  if (!key) return false;
  if (!/^[a-f0-9]{64}$/.test(key)) return false;
  saveGardenKey(vaultId, key);
  // Remove secret from browser's address bar and history after importing it.
  window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  return true;
}

export function saveOpenedVault(vault) {
  sessionStorage.setItem(OPENED_VAULT_KEY, JSON.stringify(vault));
}

export function getOpenedVault() {
  try {
    const data = sessionStorage.getItem(OPENED_VAULT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearOpenedVault() {
  sessionStorage.removeItem(OPENED_VAULT_KEY);
}
