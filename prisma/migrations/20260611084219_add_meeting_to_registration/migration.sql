-- AlterTable
ALTER TABLE `registration_applications` ADD COLUMN `meetingId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `registration_applications` ADD CONSTRAINT `registration_applications_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
