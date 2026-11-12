-- Migration: rebuild_properties_table
-- Replaces the EMPTY legacy "properties" table with the Task.md §1 shape.
-- Deliberately does NOT touch pre-existing production drift:
--   streets.uzkadupdatedat, streets_uzKadCode_fkey, uzkad_streets_districtId_fkey.

-- Safety guard: abort before any change if the legacy table contains rows.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "properties") THEN
    RAISE EXCEPTION 'Aborting rebuild_properties_table: "properties" is not empty. Back up and migrate data first.';
  END IF;
END $$;

-- DropTable (legacy, empty; its indexes and FKs are dropped with it; no other table references it)
DROP TABLE "properties";

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cadNumber" TEXT,
    "spId" TEXT,
    "spUid" TEXT,
    "propertyKind" TEXT,
    "geometry" JSONB NOT NULL,
    "center" JSONB,
    "houseNumber" TEXT,
    "newAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "districtId" TEXT NOT NULL,
    "mahallaId" TEXT,
    "streetId" TEXT,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "properties_cadNumber_key" ON "properties"("cadNumber");

-- CreateIndex
CREATE UNIQUE INDEX "properties_spId_key" ON "properties"("spId");

-- CreateIndex
CREATE INDEX "properties_districtId_idx" ON "properties"("districtId");

-- CreateIndex
CREATE INDEX "properties_mahallaId_idx" ON "properties"("mahallaId");

-- CreateIndex
CREATE INDEX "properties_streetId_idx" ON "properties"("streetId");

-- CreateIndex (active properties only; soft-deleted rows do not reserve numbers)
CREATE UNIQUE INDEX "properties_streetId_houseNumber_active_key" ON "properties"("streetId", "houseNumber") WHERE ("isActive" = true);

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "mahallas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "streets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
