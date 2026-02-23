-- CreateTable
CREATE TABLE "users_auth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "isTFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "TFASecret" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_email_key" ON "users_auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_username_key" ON "users_auth"("username");
