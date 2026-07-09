-- ============================================================
-- MediTrac Placeholder Seed Data
-- ============================================================

-- ------------------------------------------------------------
-- DRUGS
-- ------------------------------------------------------------
INSERT INTO drug (name, generic_name, manufacturer, dosage_form, strength, category) VALUES
('Amoxicillin',        'Amoxicillin',            'GenPharm Ltd',    'capsule',  '500mg',      'antibiotic'),
('Augmentin',          'Amoxicillin/Clavulanate','GSK',             'tablet',   '625mg',      'antibiotic'),
('Metformin',          'Metformin',              'Cosmos Pharma',   'tablet',   '500mg',      'antidiabetic'),
('Ventolin Inhaler',   'Salbutamol',             'GSK',             'inhaler',  '100mcg',     'bronchodilator'),
('Panadol',            'Paracetamol',            'GSK',             'tablet',   '500mg',      'analgesic'),
('Insulin Lantus',     'Insulin Glargine',       'Sanofi',          'injection','100U/mL',    'antidiabetic'),
('Diclofenac',         'Diclofenac Sodium',      'Dawa Ltd',        'tablet',   '50mg',       'nsaid'),
('Losartan',           'Losartan Potassium',     'Cosmos Pharma',   'tablet',   '50mg',       'antihypertensive'),
('Zinnat',             'Cefuroxime',             'GSK',             'tablet',   '250mg',      'antibiotic'),
('Piriton',            'Chlorphenamine',         'GSK',             'tablet',   '4mg',        'antihistamine');

-- ------------------------------------------------------------
-- PHARMACIES  (fake names, placeholder emails/phones)
-- ------------------------------------------------------------
INSERT INTO pharmacy (name, phone, email, operating_hours, password) VALUES
('Halisi Pharmacy',      '0700000001', 'test1@example.com', 'Mon-Sat 8am-8pm', 'TEMP_PASSWORD_1'),
('Glow Chemist',         '0700000002', 'test2@example.com', 'Mon-Sun 7am-9pm', 'TEMP_PASSWORD_2'),
('Wellness Pharmacy',    '0700000003', 'test3@example.com', 'Mon-Fri 8am-6pm', 'TEMP_PASSWORD_3'),
('CityCare Chemist',     '0700000004', 'test4@example.com', 'Mon-Sat 9am-7pm', 'TEMP_PASSWORD_4'),
('Estate Line Pharmacy', '0700000005', 'test5@example.com', 'Mon-Sun 24 hours','TEMP_PASSWORD_5');

-- ------------------------------------------------------------
-- LOCATIONS (fake coordinates loosely spread around Nairobi for map testing)
-- ------------------------------------------------------------
INSERT INTO location (pharmacy_id, address, city, region, latitude, longitude) VALUES
(1, '123 Kilimani Rd',     'Nairobi', 'Nairobi County', -1.2921, 36.7820),
(2, '45 Ngong Rd',         'Nairobi', 'Nairobi County', -1.3000, 36.7833),
(3, '10 Westlands Ave',    'Nairobi', 'Nairobi County', -1.2670, 36.8110),
(4, '77 Moi Avenue',       'Nairobi', 'Nairobi County', -1.2833, 36.8219),
(5, '5 Lang''ata Rd',      'Nairobi', 'Nairobi County', -1.3500, 36.7500);

-- ------------------------------------------------------------
-- INVENTORY (fake stock levels, prices, statuses)
-- drug_id 1-10 and pharmacy_id 1-5 assume fresh tables
-- ------------------------------------------------------------
INSERT INTO inventory (drug_id, pharmacy_id, quantity_available, price, status) VALUES
(1, 1, 45,  650.00,  'in_stock'),
(1, 2, 0,   650.00,  'out_of_stock'),
(2, 1, 18,  1400.00, 'in_stock'),
(2, 3, 5,   1450.00, 'low_stock'),
(3, 1, 60,  750.00,  'in_stock'),
(3, 4, 12,  700.00,  'in_stock'),
(4, 2, 2,   1200.00, 'low_stock'),
(4, 5, 30,  1150.00, 'in_stock'),
(5, 1, 200, 50.00,   'in_stock'),
(5, 3, 150, 45.00,   'in_stock'),
(6, 2, 3,   3200.00, 'low_stock'),
(6, 5, 0,   3200.00, 'out_of_stock'),
(7, 4, 80,  120.00,  'in_stock'),
(8, 3, 25,  300.00,  'in_stock'),
(9, 1, 10,  900.00,  'in_stock'),
(10,5, 40,  150.00,  'in_stock');