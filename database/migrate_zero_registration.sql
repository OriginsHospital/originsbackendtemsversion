-- Migration: add zero registration tracking and make aadhaar optional for provisional patients
ALTER TABLE patient_master
  ADD COLUMN IF NOT EXISTS isZeroRegistration TINYINT(1) NOT NULL DEFAULT 0 AFTER uploadedDocuments,
  ADD COLUMN IF NOT EXISTS zeroRegistrationCode VARCHAR(30) NULL AFTER isZeroRegistration;

-- Allow storing patients without aadhaar when using zero registration
ALTER TABLE patient_master
  MODIFY COLUMN aadhaarNo VARCHAR(12) NULL;

