import { api } from "../../../lib/api";

export async function getVaults() {
  const response = await api.get("/vaults");
  return response.data.vaults;
}

export async function getVaultById(vaultId) {
  const response = await api.get(`/vaults/${vaultId}`);
  return response.data.vault;
}

export async function createVault(vaultData) {
  const response = await api.post("/vaults", vaultData);
  return response.data.vault;
}

export async function updateVault(vaultId, vaultData) {
  const response = await api.put(`/vaults/${vaultId}`, vaultData);
  return response.data.vault;
}

export async function deleteVault(vaultId) {
  const response = await api.delete(`/vaults/${vaultId}`);
  return response.data;
}

export async function generateVaultCode(vaultId) {
  const response = await api.post(`/vaults/${vaultId}/generate-code`);
  return response.data;
}

export async function addLetterToVault(vaultId, letterData) {
  const response = await api.post(`/vaults/${vaultId}/letters`, letterData);
  return response.data.letter;
}

export async function getVaultLetters(vaultId) {
  const response = await api.get(`/vaults/${vaultId}/letters`);
  return response.data.letters;
}

export async function deleteVaultLetter(vaultId, letterId) {
  const response = await api.delete(`/vaults/${vaultId}/letters/${letterId}`);
  return response.data;
}

export async function unlockVault(code) {
  const response = await api.post("/vaults/unlock", { code });
  return response.data.vault;
}