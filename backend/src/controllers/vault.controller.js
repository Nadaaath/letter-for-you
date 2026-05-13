import {
  createVault,
  deleteVault,
  generateCodeForVault,
  getUserVaultById,
  getUserVaults,
  unlockVaultByCode,
  updateVault,
} from "../services/vault.service.js";

import {
  createLetter,
  deleteLetter,
  getLetterById,
  getLettersByVault,
  updateLetter,
} from "../services/letter.service.js";

export async function create(req, res, next) {
  try {
    const vault = await createVault(req.user.id, req.body);

    res.status(201).json({
      message: "Private garden created successfully",
      vault,
    });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const vaults = await getUserVaults(req.user.id);

    res.json({
      vaults,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const vault = await getUserVaultById(req.user.id, req.params.vaultId);

    res.json({
      vault,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const vault = await updateVault(req.user.id, req.params.vaultId, req.body);

    res.json({
      message: "Private garden updated successfully",
      vault,
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await deleteVault(req.user.id, req.params.vaultId);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateCode(req, res, next) {
  try {
    const result = await generateCodeForVault(req.user.id, req.params.vaultId);

    res.json({
      message: "Access code generated successfully",
      vault: result.vault,
      accessCode: result.accessCode,
      warning:
        "This code is shown only once. Save it before leaving this page.",
    });
  } catch (error) {
    next(error);
  }
}

export async function unlock(req, res, next) {
  try {
    const vault = await unlockVaultByCode(req.body.code);

    res.json({
      message: "Private garden unlocked successfully",
      vault,
    });
  } catch (error) {
    next(error);
  }
}

export async function addLetter(req, res, next) {
  try {
    const letter = await createLetter(
      req.user.id,
      req.params.vaultId,
      req.body
    );

    res.status(201).json({
      message: "Letter added successfully",
      letter,
    });
  } catch (error) {
    next(error);
  }
}

export async function listLetters(req, res, next) {
  try {
    const letters = await getLettersByVault(req.user.id, req.params.vaultId);

    res.json({
      letters,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLetter(req, res, next) {
  try {
    const letter = await getLetterById(
      req.user.id,
      req.params.vaultId,
      req.params.letterId
    );

    res.json({
      letter,
    });
  } catch (error) {
    next(error);
  }
}

export async function editLetter(req, res, next) {
  try {
    const letter = await updateLetter(
      req.user.id,
      req.params.vaultId,
      req.params.letterId,
      req.body
    );

    res.json({
      message: "Letter updated successfully",
      letter,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeLetter(req, res, next) {
  try {
    const result = await deleteLetter(
      req.user.id,
      req.params.vaultId,
      req.params.letterId
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}