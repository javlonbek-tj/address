-- Migration: add_reserved_house_numbers
-- Additive only: creates the reserved_house_numbers table. No existing table is changed.
-- Deliberately does NOT touch pre-existing production drift:
--   streets.uzkadupdatedat, streets_uzKadCode_fkey, uzkad_streets_districtId_fkey.

-- CreateTable
CREATE TABLE "reserved_house_numbers" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "createdById" TEXT,
    "streetId" TEXT NOT NULL,

    CONSTRAINT "reserved_house_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reserved_house_numbers_streetId_houseNumber_key" ON "reserved_house_numbers"("streetId", "houseNumber");

-- AddForeignKey
ALTER TABLE "reserved_house_numbers" ADD CONSTRAINT "reserved_house_numbers_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "streets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
