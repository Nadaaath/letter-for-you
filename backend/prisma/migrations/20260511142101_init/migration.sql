-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letters" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fontFamily" TEXT NOT NULL DEFAULT 'Playfair Display',
    "textColor" TEXT NOT NULL DEFAULT '#7f1d1d',
    "backgroundColor" TEXT NOT NULL DEFAULT '#fff7ed',
    "theme" TEXT NOT NULL DEFAULT 'rose',
    "decoration" TEXT NOT NULL DEFAULT 'flowers',
    "accessCodeHash" TEXT,
    "hasAccessCode" BOOLEAN NOT NULL DEFAULT false,
    "isOpenOnce" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "letters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
