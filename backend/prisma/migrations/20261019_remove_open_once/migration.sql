-- Remove obsolete one-time-reading fields from letters.
ALTER TABLE "letters"
  DROP COLUMN "isOpenOnce",
  DROP COLUMN "openedAt";
