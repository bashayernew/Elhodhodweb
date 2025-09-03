/*
  Warnings:

  - You are about to drop the column `taxNumber` on the `providers` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_providers" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "brandName" TEXT NOT NULL,
    "divisions" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "workHours" TEXT,
    "serviceRadiusKm" INTEGER,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending_verification',
    "verifiedAt" DATETIME,
    "rejectionReason" TEXT,
    "crNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_providers" ("brandName", "categories", "crNumber", "createdAt", "divisions", "rejectionReason", "serviceRadiusKm", "updatedAt", "userId", "verificationStatus", "verifiedAt", "workHours") SELECT "brandName", "categories", "crNumber", "createdAt", "divisions", "rejectionReason", "serviceRadiusKm", "updatedAt", "userId", "verificationStatus", "verifiedAt", "workHours" FROM "providers";
DROP TABLE "providers";
ALTER TABLE "new_providers" RENAME TO "providers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
