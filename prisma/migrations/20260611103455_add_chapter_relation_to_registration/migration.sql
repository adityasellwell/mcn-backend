-- AlterTable
ALTER TABLE `registration_applications` ADD COLUMN `chapterId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `registration_applications` ADD CONSTRAINT `registration_applications_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
