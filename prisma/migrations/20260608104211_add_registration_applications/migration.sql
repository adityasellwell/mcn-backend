-- CreateTable
CREATE TABLE `registration_applications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registrationType` ENUM('MEMBER', 'GUEST', 'VISITOR', 'OTHER') NOT NULL,
    `chapterName` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `businessCategory` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `venue` VARCHAR(191) NOT NULL,
    `referredBy` VARCHAR(191) NULL,
    `paymentScreenshot` VARCHAR(191) NULL,
    `utrNumber` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
