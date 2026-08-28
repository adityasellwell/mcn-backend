-- Add meetingQrUrl column to meetings
ALTER TABLE `meetings`
ADD COLUMN `meetingQrUrl` TEXT NULL;
