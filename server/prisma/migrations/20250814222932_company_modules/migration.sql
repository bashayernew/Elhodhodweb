-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "block" TEXT;
ALTER TABLE "profiles" ADD COLUMN "houseNumber" TEXT;
ALTER TABLE "profiles" ADD COLUMN "street" TEXT;

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "technician" TEXT,
    "branch" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "calendar_events_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "segments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "customer_profiles_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "date" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payouts_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
