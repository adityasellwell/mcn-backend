/*
  Warnings:

  - You are about to drop the column `instagram` on the `registration_applications` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `registration_applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `registration_applications` DROP COLUMN `instagram`,
    DROP COLUMN `linkedin`,
    ADD COLUMN `socialProfiles` JSON NULL;
