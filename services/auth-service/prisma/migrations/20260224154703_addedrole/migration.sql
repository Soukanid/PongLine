/*
  Warnings:

  - Added the required column `role` to the `users_auth` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users_auth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "isTFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "TFASecret" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users_auth" ("TFASecret", "createdAt", "email", "id", "isTFAEnabled", "passwordHash", "updatedAt", "userId", "username") SELECT "TFASecret", "createdAt", "email", "id", "isTFAEnabled", "passwordHash", "updatedAt", "userId", "username" FROM "users_auth";
DROP TABLE "users_auth";
ALTER TABLE "new_users_auth" RENAME TO "users_auth";
CREATE UNIQUE INDEX "users_auth_email_key" ON "users_auth"("email");
CREATE UNIQUE INDEX "users_auth_username_key" ON "users_auth"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
