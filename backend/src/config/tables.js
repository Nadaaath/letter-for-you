export const tables = Object.freeze({
  gardens: process.env.GARDENS_TABLE_NAME || "Gardens",
  letters: process.env.LETTERS_TABLE_NAME || "Letters",
  codes: process.env.RECIPIENT_CODES_TABLE_NAME || "RecipientCodes",
});
