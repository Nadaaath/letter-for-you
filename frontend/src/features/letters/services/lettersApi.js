import { api } from "../../../lib/api";
import { getGardenKey } from "../../../lib/storage";

function managementConfig(vaultId) {
  const key = getGardenKey(vaultId);
  if (!key) throw new Error("This garden is not saved on this device. Open its private management link.");
  return { headers: { "x-garden-key": key } };
}

export async function getVaultById(vaultId) {
  const response = await api.get(`/vaults/${vaultId}`, managementConfig(vaultId));
  return response.data.vault;
}

export async function createVault(vaultData) {
  const response = await api.post("/vaults", vaultData);
  return response.data; // { vault, managementToken }
}

export async function updateVault(vaultId, data) {
  const response = await api.put(`/vaults/${vaultId}`, data, managementConfig(vaultId));
  return response.data.vault;
}

export async function deleteVault(vaultId) {
  const response = await api.delete(`/vaults/${vaultId}`, managementConfig(vaultId));
  return response.data;
}

export async function generateVaultCode(vaultId) {
  const response = await api.post(`/vaults/${vaultId}/generate-code`, {}, managementConfig(vaultId));
  return response.data;
}

export async function addLetterToVault(vaultId, data) {
  const response = await api.post(`/vaults/${vaultId}/letters`, data, managementConfig(vaultId));
  return response.data.letter;
}

export async function getVaultLetters(vaultId) {
  const response = await api.get(`/vaults/${vaultId}/letters`, managementConfig(vaultId));
  return response.data.letters;
}

export async function deleteVaultLetter(vaultId, letterId) {
  const response = await api.delete(`/vaults/${vaultId}/letters/${letterId}`, managementConfig(vaultId));
  return response.data;
}

export async function unlockVault(code) {
  const response = await api.post("/vaults/unlock", { code });
  return response.data.vault;
}
