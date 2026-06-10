/*
  Warnings:

  - A unique constraint covering the columns `[uzKadCode]` on the table `streets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "uzkad_streets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "districtId" TEXT NOT NULL,

    CONSTRAINT "uzkad_streets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uzkad_streets_code_key" ON "uzkad_streets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "streets_uzKadCode_key" ON "streets"("uzKadCode");

-- AddForeignKey
ALTER TABLE "streets" ADD CONSTRAINT "streets_uzKadCode_fkey" FOREIGN KEY ("uzKadCode") REFERENCES "uzkad_streets"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uzkad_streets" ADD CONSTRAINT "uzkad_streets_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
