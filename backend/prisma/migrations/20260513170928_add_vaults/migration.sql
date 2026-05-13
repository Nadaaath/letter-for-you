/*
  Warnings:

  - You are about to drop the column `accessCodeHash` on the `letters` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundColor` on the `letters` table. All the data in the column will be lost.
  - You are about to drop the column `decoration` on the `letters` table. All the data in the column will be lost.
  - You are about to drop the column `fontFamily` on the `letters` table. All the data in the column will be lost.
  - You are about to drop the column `hasAccessCode` on the `letters` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `letters` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `letters` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `letters` table. All the data in the column will be lost.
  - Added the required column `vaultId` to the `letters` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "letters" DROP CONSTRAINT "letters_userId_fkey";

-- AlterTable
ALTER TABLE "letters" DROP COLUMN "accessCodeHash",
DROP COLUMN "backgroundColor",
DROP COLUMN "decoration",
DROP COLUMN "fontFamily",
DROP COLUMN "hasAccessCode",
DROP COLUMN "textColor",
DROP COLUMN "theme",
DROP COLUMN "userId",
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recipientName" TEXT,
ADD COLUMN     "senderName" TEXT,
ADD COLUMN     "styleConfig" JSONB,
ADD COLUMN     "vaultId" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;

-- CreateTable
CREATE TABLE "vaults" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accessCodeHash" TEXT,
    "hasAccessCode" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaults_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "vaults"("id") ON DELETE CASCADE ON UPDATE CASCADE;
