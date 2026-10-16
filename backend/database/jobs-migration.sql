SET @has_company_name := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Jobs' AND COLUMN_NAME = 'CompanyName'
);
SET @ddl := IF(@has_company_name = 0,
    'ALTER TABLE Jobs ADD COLUMN CompanyName VARCHAR(50) NOT NULL DEFAULT '''' AFTER JobTitle',
    'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
