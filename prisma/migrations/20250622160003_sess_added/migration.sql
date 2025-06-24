/*
  Warnings:

  - You are about to drop the column `data` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `sess` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "data",
ADD COLUMN     "sess" TEXT NOT NULL;
