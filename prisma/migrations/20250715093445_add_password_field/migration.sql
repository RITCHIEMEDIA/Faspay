/*
  Warnings:

  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "kycStatus" SET DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
