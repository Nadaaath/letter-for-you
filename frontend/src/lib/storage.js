const TOKEN_KEY = "letter_for_you_token";
const OPENED_LETTER_KEY = "opened_letter";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveOpenedLetter(letter) {
  sessionStorage.setItem(OPENED_LETTER_KEY, JSON.stringify(letter));
}

export function getOpenedLetter() {
  const storedLetter = sessionStorage.getItem(OPENED_LETTER_KEY);

  if (!storedLetter) {
    return null;
  }

  return JSON.parse(storedLetter);
}

export function clearOpenedLetter() {
  sessionStorage.removeItem(OPENED_LETTER_KEY);
}