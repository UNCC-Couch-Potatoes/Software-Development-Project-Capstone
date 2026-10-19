-- Adds the OwnerUserId column to Jobs for an existing database.
-- Safe to rerun. Select the application database first (USE ctrlf;).
-- New databases get the column from schema.sql and don't need this file.
SET @has_owner := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Jobs' AND COLUMN_NAME = 'OwnerUserId'
);
SET @sql := IF(@has_owner = 0,
    'ALTER TABLE Jobs ADD COLUMN OwnerUserId BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;