import { api } from "../../../lib/api";

export async function getLetters() {
  const response = await api.get("/letters");
  return response.data.letters;
}

export async function getLetterById(letterId) {
  const response = await api.get(`/letters/${letterId}`);
  return response.data.letter;
}

export async function createLetter(letterData) {
  const response = await api.post("/letters", letterData);
  return response.data.letter;
}

export async function updateLetter(letterId, letterData) {
  const response = await api.put(`/letters/${letterId}`, letterData);
  return response.data.letter;
}

export async function deleteLetter(letterId) {
  const response = await api.delete(`/letters/${letterId}`);
  return response.data;
}

export async function generateLetterCode(letterId) {
  const response = await api.post(`/letters/${letterId}/generate-code`);
  return response.data;
}

export async function unlockLetter(code) {
  const response = await api.post("/letters/unlock", { code });
  return response.data.letter;
}