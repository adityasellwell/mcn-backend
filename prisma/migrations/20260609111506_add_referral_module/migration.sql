-- CreateTable
CREATE TABLE `referrals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `givenByMemberId` INTEGER NOT NULL,
    `receivedByMemberId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `referralValue` DECIMAL(10, 2) NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'CLOSED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_givenByMemberId_fkey` FOREIGN KEY (`givenByMemberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_receivedByMemberId_fkey` FOREIGN KEY (`receivedByMemberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
