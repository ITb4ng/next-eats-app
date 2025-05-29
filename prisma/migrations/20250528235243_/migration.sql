/*
  Warnings:

  - The `lat` column on the `Store` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lng` column on the `Store` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "lat",
ADD COLUMN     "lat" DOUBLE PRECISION,
DROP COLUMN "lng",
ADD COLUMN     "lng" DOUBLE PRECISION;
