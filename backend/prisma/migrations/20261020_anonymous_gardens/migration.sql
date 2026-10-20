-- Add anonymous management without destroying historical users or gardens.
-- Existing account-owned gardens remain in the database but have no anonymous
-- management token until explicitly migrated with a separately verified process.
ALTER TABLE "vaults" ADD COLUMN "ownerTokenHash" TEXT;
ALTER TABLE "vaults" ALTER COLUMN "userId" DROP NOT NULL;
CREATE UNIQUE INDEX "vaults_ownerTokenHash_key" ON "vaults"("ownerTokenHash");
