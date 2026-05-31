const TOKEN_KEY = "letter_for_you_token";
const OPENED_VAULT_KEY = "opened_vault";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveOpenedVault(vault) {
  sessionStorage.setItem(OPENED_VAULT_KEY, JSON.stringify(vault));
}

export function getOpenedVault() {
  const storedVault = sessionStorage.getItem(OPENED_VAULT_KEY);

  if (!storedVault) {
    return null;
  }

  return JSON.parse(storedVault);
}

export function clearOpenedVault() {
  sessionStorage.removeItem(OPENED_VAULT_KEY);
}