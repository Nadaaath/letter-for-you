import {
  createVault,
  deleteVault,
  generateCodeForVault,
  getManagedVault,
  unlockVaultByCode,
  updateVault,
} from "../services/vault.service.js";
import {
  createLetter,
  deleteLetter,
  getLetterById,
  getLettersByVault,
} from "../services/letter.service.js";

export async function create(req, res, next) {
  try {
    const { vault, managementToken } = await createVault(req.body);
    res.status(201).json({ vault, managementToken });
  } catch (error) { next(error); }
}

export async function getById(req, res, next) {
  try { res.json({ vault: await getManagedVault(req.params.vaultId) }); }
  catch (error) { next(error); }
}

export async function update(req, res, next) {
  try { res.json({ vault: await updateVault(req.params.vaultId, req.body) }); }
  catch (error) { next(error); }
}

export async function remove(req, res, next) {
  try { res.json(await deleteVault(req.params.vaultId)); }
  catch (error) { next(error); }
}

export async function generateCode(req, res, next) {
  try { res.json(await generateCodeForVault(req.params.vaultId)); }
  catch (error) { next(error); }
}

export async function unlock(req, res, next) {
  try { res.json({ vault: await unlockVaultByCode(req.body.code) }); }
  catch (error) { next(error); }
}

export async function addLetter(req, res, next) {
  try { res.status(201).json({ letter: await createLetter(req.params.vaultId, req.body) }); }
  catch (error) { next(error); }
}

export async function listLetters(req, res, next) {
  try { res.json({ letters: await getLettersByVault(req.params.vaultId) }); }
  catch (error) { next(error); }
}

export async function getLetter(req, res, next) {
  try { res.json({ letter: await getLetterById(req.params.vaultId, req.params.letterId) }); }
  catch (error) { next(error); }
}

export async function removeLetter(req, res, next) {
  try { res.json(await deleteLetter(req.params.vaultId, req.params.letterId)); }
  catch (error) { next(error); }
}
