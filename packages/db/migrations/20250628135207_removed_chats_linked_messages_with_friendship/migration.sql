/*
  Warnings:

  - You are about to drop the column `chatId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `friendshipId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_friendshipId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chatId",
ADD COLUMN     "friendshipId" UUID NOT NULL,
ADD COLUMN     "isSeen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSent" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Chat";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "Friendship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
