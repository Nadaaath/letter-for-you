import {
  createLetter,
  getUserLetters,
  getUserLetterById,
  updateLetter,
  deleteLetter,
  generateCodeForLetter,
  unlockLetterByCode,
} from "../services/letter.service.js";

export async function create(req, res, next) {
  try {
    const letter = await createLetter(req.user.id, req.body);

    res.status(201).json({
      message: "Letter created successfully",
      letter,
    });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const letters = await getUserLetters(req.user.id);

    res.json({
      letters,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const letter = await getUserLetterById(req.user.id, req.params.id);

    res.json({
      letter,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const letter = await updateLetter(req.user.id, req.params.id, req.body);

    res.json({
      message: "Letter updated successfully",
      letter,
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await deleteLetter(req.user.id, req.params.id);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateCode(req, res, next) {
  try {
    const result = await generateCodeForLetter(req.user.id, req.params.id);

    res.json({
      message: "Access code generated successfully",
      letter: result.letter,
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
    const letter = await unlockLetterByCode(req.body.code);

    res.json({
      message: "Letter unlocked successfully",
      letter,
    });
  } catch (error) {
    next(error);
  }
}