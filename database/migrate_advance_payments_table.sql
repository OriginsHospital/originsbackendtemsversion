-- Migration script to update patient_other_payment_associations table
-- Changes:
-- 1. Rename appointmentReason column to billingCategory
-- 2. Add notes column (TEXT, nullable)

-- Step 1: Add the new billingCategory column
ALTER TABLE patient_other_payment_associations 
ADD COLUMN billingCategory VARCHAR(100) NULL AFTER patientId;

-- Step 2: Copy data from appointmentReason to billingCategory (if data exists)
UPDATE patient_other_payment_associations 
SET billingCategory = appointmentReason 
WHERE appointmentReason IS NOT NULL;

-- Step 3: Make billingCategory NOT NULL after data migration
ALTER TABLE patient_other_payment_associations 
MODIFY COLUMN billingCategory VARCHAR(100) NOT NULL;

-- Step 4: Add notes column
ALTER TABLE patient_other_payment_associations 
ADD COLUMN notes TEXT NULL AFTER amount;

-- Step 5: Drop the old appointmentReason column (after verifying data migration)
-- Uncomment the line below after verifying that all data has been migrated successfully
-- ALTER TABLE patient_other_payment_associations DROP COLUMN appointmentReason;

