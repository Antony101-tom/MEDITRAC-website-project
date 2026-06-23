-- ============================================================
-- Drug Availability Tracking System - Database Schema
-- ============================================================
-- Set timezone to Universal Coordinated Time (UTC) for consistency in timestamps
SET timezone = 'UTC';


-- 1. DRUG table
--    Stores information about each drug in the system
CREATE TABLE drug (
    drug_id        SERIAL PRIMARY KEY,
    name           VARCHAR(150)  NOT NULL,
    generic_name   VARCHAR(150),
    manufacturer   VARCHAR(150),
    dosage_form    VARCHAR(50),          -- e.g. tablet, capsule, syrup
    strength       VARCHAR(50),          -- e.g. 500mg, 10mg/5ml
    category       VARCHAR(100),         -- e.g. antibiotic, analgesic
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PHARMACY table
--    Stores each registered pharmacy
CREATE TABLE pharmacy (
    pharmacy_id      SERIAL PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    phone            VARCHAR(20),
    email            VARCHAR(100),
    operating_hours  VARCHAR(100),       -- e.g. Mon-Sat 8am-8pm
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. LOCATION table
--    Each pharmacy has one location (address + coordinates for map search)
CREATE TABLE location (
    location_id   SERIAL PRIMARY KEY,
    pharmacy_id   INT NOT NULL REFERENCES pharmacy(pharmacy_id) ON DELETE CASCADE,
    address       VARCHAR(255) NOT NULL,
    city          VARCHAR(100),
    region        VARCHAR(100),
    latitude      DECIMAL(9, 6),
    longitude     DECIMAL(9, 6),
    UNIQUE(pharmacy_id)                 -- one location per pharmacy
);

-- 4. INVENTORY table
--    Tracks which drugs are available at which pharmacy, and in what quantity
CREATE TABLE inventory (
    inventory_id       SERIAL PRIMARY KEY,
    drug_id            INT NOT NULL REFERENCES drug(drug_id) ON DELETE CASCADE,
    pharmacy_id        INT NOT NULL REFERENCES pharmacy(pharmacy_id) ON DELETE CASCADE,
    quantity_available INT     NOT NULL DEFAULT 0,
    price              DECIMAL(10, 2),
    status             VARCHAR(20) NOT NULL DEFAULT 'in_stock'
                           CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
    last_updated       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(drug_id, pharmacy_id)        -- one record per drug per pharmacy
);

-- ============================================================
-- Indexes for fast search queries
-- ============================================================

-- Search drugs by name
CREATE INDEX idx_drug_name        ON drug(name);
CREATE INDEX idx_drug_generic     ON drug(generic_name);
CREATE INDEX idx_drug_category    ON drug(category);

-- Search pharmacies by location
CREATE INDEX idx_location_city    ON location(city);
CREATE INDEX idx_location_region  ON location(region);
CREATE INDEX idx_location_coords  ON location(latitude, longitude);

-- Filter inventory by availability
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_drug   ON inventory(drug_id);
CREATE INDEX idx_inventory_pharm  ON inventory(pharmacy_id);

-- ============================================================
-- Useful view: search drugs by name and see all pharmacy stock
-- ============================================================

CREATE VIEW drug_availability AS
SELECT
    d.name              AS drug_name,
    d.generic_name,
    d.dosage_form,
    d.strength,
    p.name              AS pharmacy_name,
    p.phone             AS pharmacy_phone,
    l.address,
    l.city,
    l.region,
    l.latitude,
    l.longitude,
    i.quantity_available,
    i.price,
    i.status,
    i.last_updated
FROM inventory i
JOIN drug     d ON i.drug_id     = d.drug_id
JOIN pharmacy p ON i.pharmacy_id = p.pharmacy_id
JOIN location l ON p.pharmacy_id = l.pharmacy_id;

-- ============================================================
-- Example queries
-- ============================================================

-- Find all pharmacies that have Amoxicillin in stock
-- SELECT * FROM drug_availability
-- WHERE drug_name ILIKE '%amoxicillin%'
--   AND status = 'in_stock';

-- Find all drugs available in Nairobi
-- SELECT * FROM drug_availability
-- WHERE city = 'Nairobi'
--   AND status != 'out_of_stock'
-- ORDER BY drug_name;
