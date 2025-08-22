/*
  Warnings:

  - You are about to drop the column `totalStakeAmount` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `isSeen` on the `GroupMessage` table. All the data in the column will be lost.
  - You are about to drop the column `isSent` on the `GroupMessage` table. All the data in the column will be lost.
  - You are about to drop the `_ContestMembers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[pubKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('UPCOMING', 'ONGOING', 'VOTING', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "_ContestMembers" DROP CONSTRAINT "_ContestMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContestMembers" DROP CONSTRAINT "_ContestMembers_B_fkey";

-- AlterTable
ALTER TABLE "Contest" DROP COLUMN "totalStakeAmount",
ADD COLUMN     "status" "ContestStatus" NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "GroupMessage" DROP COLUMN "isSeen",
DROP COLUMN "isSent";

-- DropTable
DROP TABLE "_ContestMembers";

-- CreateTable
CREATE TABLE "ContestMembership" (
    "id" UUID NOT NULL,
    "stake" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "contestId" UUID NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContestMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestVote" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "contestId" UUID NOT NULL,
    "contestMemberId" UUID NOT NULL,

    CONSTRAINT "ContestVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContestMembership_userId_contestId_key" ON "ContestMembership"("userId", "contestId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestVote_userId_contestId_key" ON "ContestVote"("userId", "contestId");

-- CreateIndex
CREATE INDEX "Friendship_userAId_idx" ON "Friendship"("userAId");

-- CreateIndex
CREATE INDEX "Friendship_userBId_idx" ON "Friendship"("userBId");

-- CreateIndex
CREATE INDEX "GroupMessage_groupId_timestamp_idx" ON "GroupMessage"("groupId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "Message_friendshipId_timestamp_idx" ON "Message"("friendshipId", "timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "User_pubKey_key" ON "User"("pubKey");

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestVote" ADD CONSTRAINT "ContestVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestVote" ADD CONSTRAINT "ContestVote_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestVote" ADD CONSTRAINT "ContestVote_contestMemberId_fkey" FOREIGN KEY ("contestMemberId") REFERENCES "ContestMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
