import { prisma } from "../config/prisma.js";
import {
  generateAccessCode,
  hashAccessCode,
  compareAccessCode,
  normalizeCode,
} from "./code.service.js";

export async function createLetter(userId, data) {
  const letter = await prisma.letter.create({
    data: {
      title: data.title,
      content: data.content,

      fontFamily: data.fontFamily || "Playfair Display",
      textColor: data.textColor || "#7f1d1d",
      backgroundColor: data.backgroundColor || "#fff7ed",
      theme: data.theme || "rose",
      decoration: data.decoration || "flowers",

      isOpenOnce: data.isOpenOnce || false,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,

      userId,
    },
  });

  return letter;
}

export async function getUserLetters(userId) {
  return prisma.letter.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      fontFamily: true,
      textColor: true,
      backgroundColor: true,
      theme: true,
      decoration: true,
      hasAccessCode: true,
      isOpenOnce: true,
      openedAt: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserLetterById(userId, letterId) {
  const letter = await prisma.letter.findFirst({
    where: {
      id: letterId,
      userId,
    },
  });

  if (!letter) {
    const error = new Error("Letter not found");
    error.statusCode = 404;
    throw error;
  }

  return letter;
}

export async function updateLetter(userId, letterId, data) {
  await getUserLetterById(userId, letterId);

  const updatedLetter = await prisma.letter.update({
    where: { id: letterId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.fontFamily !== undefined && { fontFamily: data.fontFamily }),
      ...(data.textColor !== undefined && { textColor: data.textColor }),
      ...(data.backgroundColor !== undefined && {
        backgroundColor: data.backgroundColor,
      }),
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.decoration !== undefined && { decoration: data.decoration }),
      ...(data.isOpenOnce !== undefined && { isOpenOnce: data.isOpenOnce }),
      ...(data.expiresAt !== undefined && {
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }),
    },
  });

  return updatedLetter;
}

export async function deleteLetter(userId, letterId) {
  await getUserLetterById(userId, letterId);

  await prisma.letter.delete({
    where: { id: letterId },
  });

  return { message: "Letter deleted successfully" };
}

export async function generateCodeForLetter(userId, letterId) {
  await getUserLetterById(userId, letterId);

  const plainCode = generateAccessCode();
  const codeHash = await hashAccessCode(plainCode);

  const letter = await prisma.letter.update({
    where: { id: letterId },
    data: {
      accessCodeHash: codeHash,
      hasAccessCode: true,
      openedAt: null,
    },
    select: {
      id: true,
      title: true,
      hasAccessCode: true,
      isOpenOnce: true,
      expiresAt: true,
    },
  });

  return {
    letter,
    accessCode: plainCode,
  };
}

export async function unlockLetterByCode(code) {
  const normalizedCode = normalizeCode(code);

  const letters = await prisma.letter.findMany({
    where: {
      hasAccessCode: true,
      accessCodeHash: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  let matchedLetter = null;

  for (const letter of letters) {
    const isMatch = await compareAccessCode(normalizedCode, letter.accessCodeHash);

    if (isMatch) {
      matchedLetter = letter;
      break;
    }
  }

  if (!matchedLetter) {
    const error = new Error("Invalid access code");
    error.statusCode = 404;
    throw error;
  }

  if (matchedLetter.expiresAt && matchedLetter.expiresAt < new Date()) {
    const error = new Error("This letter has expired");
    error.statusCode = 410;
    throw error;
  }

  if (matchedLetter.isOpenOnce && matchedLetter.openedAt) {
    const error = new Error("This letter has already been opened");
    error.statusCode = 410;
    throw error;
  }

  if (matchedLetter.isOpenOnce) {
    await prisma.letter.update({
      where: { id: matchedLetter.id },
      data: {
        openedAt: new Date(),
      },
    });
  }

  return {
    id: matchedLetter.id,
    title: matchedLetter.title,
    content: matchedLetter.content,
    fontFamily: matchedLetter.fontFamily,
    textColor: matchedLetter.textColor,
    backgroundColor: matchedLetter.backgroundColor,
    theme: matchedLetter.theme,
    decoration: matchedLetter.decoration,
    from: matchedLetter.user.name,
    openedAt: matchedLetter.isOpenOnce ? new Date() : matchedLetter.openedAt,
  };
}