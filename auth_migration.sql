-- ============================================================
-- Auth Migration: adds login support for pharmacies and users
-- ============================================================

-- 1. Add password  to the existing pharmacy table
ALTER TABLE pharmacy
    ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'CHANGE_ME';

-- Remove the temporary default once real data exists, so future inserts
-- are forced to always provide a password:
ALTER TABLE pharmacy
    ALTER COLUMN password DROP DEFAULT;

-- Email should be unique so it can be used as a login identifier
ALTER TABLE pharmacy
    ADD CONSTRAINT pharmacy_email_unique UNIQUE (email);


-- 2. New table: patient_user
--    Stores regular patient/user accounts 
CREATE TABLE patient_user (
    user_id        SERIAL PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    phone          VARCHAR(20),
    location_text  VARCHAR(150),     -- e.g. "Kilimani, Nairobi" - free text, not linked to `location` table
    password       VARCHAR(255) NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patient_user_email ON patient_user(email);