/*
  Warnings:

  - A unique constraint covering the columns `[friendshipId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `friendshipId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "friendshipId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_friendshipId_key" ON "Chat"("friendshipId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "Friendship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
