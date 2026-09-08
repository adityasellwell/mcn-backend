-- Add BNI member fields to registration_applications
ALTER TABLE `registration_applications` ADD COLUMN `isBniMember` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `registration_applications` ADD COLUMN `bniChapter` VARCHAR(255) NULL;

-- Add payment method field to registration_applications
ALTER TABLE `registration_applications` ADD COLUMN `paymentMethod` VARCHAR(20) NOT NULL DEFAULT 'ONLINE';

-- Add BNI member fields to members
ALTER TABLE `members` ADD COLUMN `isBniMember` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `members` ADD COLUMN `bniChapter` VARCHAR(255) NULL;
