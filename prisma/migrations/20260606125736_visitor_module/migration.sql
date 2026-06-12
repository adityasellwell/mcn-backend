-- CreateTable
CREATE TABLE `visitors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NULL,
    `profession` VARCHAR(191) NULL,
    `businessCategory` VARCHAR(191) NULL,
    `source` ENUM('ADMIN', 'MEMBER', 'WEBSITE') NOT NULL,
    `status` ENUM('LEAD', 'INVITED', 'REGISTERED', 'PAYMENT_SUBMITTED', 'PAID', 'ATTENDED', 'CONVERTED', 'REJECTED') NOT NULL DEFAULT 'LEAD',
    `referredByMemberId` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visitors_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meetingId` INTEGER NOT NULL,
    `memberId` INTEGER NOT NULL,
    `paymentStatus` ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `paymentScreenshot` VARCHAR(191) NULL,
    `utrNumber` VARCHAR(191) NULL,
    `attendanceStatus` ENUM('PRESENT', 'ABSENT', 'LATE') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `meeting_members_meetingId_memberId_key`(`meetingId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_visitors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meetingId` INTEGER NOT NULL,
    `visitorId` INTEGER NOT NULL,
    `paymentStatus` ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `paymentScreenshot` VARCHAR(191) NULL,
    `utrNumber` VARCHAR(191) NULL,
    `attendanceStatus` ENUM('PRESENT', 'ABSENT', 'LATE') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `meeting_visitors_meetingId_visitorId_key`(`meetingId`, `visitorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `visitors` ADD CONSTRAINT `visitors_referredByMemberId_fkey` FOREIGN KEY (`referredByMemberId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_members` ADD CONSTRAINT `meeting_members_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_members` ADD CONSTRAINT `meeting_members_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_visitors` ADD CONSTRAINT `meeting_visitors_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_visitors` ADD CONSTRAINT `meeting_visitors_visitorId_fkey` FOREIGN KEY (`visitorId`) REFERENCES `visitors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
