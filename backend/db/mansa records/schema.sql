-- ============================================
-- Mansa Municipal Council Records System
-- PostgreSQL Schema
-- ============================================

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS business_licences CASCADE;
DROP TABLE IF EXISTS land_records CASCADE;
DROP TABLE IF EXISTS citizens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- USERS (Staff Accounts)
-- ============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  username VARCHAR(80) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'clerk', 'viewer')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CITIZENS / RESIDENTS
-- ============================================
CREATE TABLE citizens (
  id SERIAL PRIMARY KEY,
  nrc_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
  phone VARCHAR(20),
  email VARCHAR(150),
  address TEXT,
  ward VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Deceased', 'Relocated')),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- LAND & PROPERTY RECORDS
-- ============================================
CREATE TABLE land_records (
  id SERIAL PRIMARY KEY,
  plot_number VARCHAR(80) UNIQUE NOT NULL,
  owner_nrc VARCHAR(50),
  owner_name VARCHAR(200) NOT NULL,
  owner_phone VARCHAR(20),
  location TEXT NOT NULL,
  ward VARCHAR(100),
  area_sqm NUMERIC(10, 2),
  land_use VARCHAR(50) CHECK (land_use IN ('Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed')),
  status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Active', 'Disputed', 'Transferred', 'Revoked')),
  registered_date DATE,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- BUSINESS LICENCES
-- ============================================
CREATE TABLE business_licences (
  id SERIAL PRIMARY KEY,
  licence_number VARCHAR(80) UNIQUE NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  owner_nrc VARCHAR(50),
  owner_name VARCHAR(200) NOT NULL,
  business_type VARCHAR(100),
  address TEXT,
  ward VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(150),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Suspended', 'Revoked')),
  issue_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SEED: Default Admin User
-- Password: admin123 (bcrypt hash)
-- ============================================
INSERT INTO users (full_name, username, email, password_hash, role)
VALUES (
  'System Administrator',
  'admin',
  'admin@mansa.gov.zm',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin'
);

-- Sample Clerk
INSERT INTO users (full_name, username, email, password_hash, role)
VALUES (
  'Mary Phiri',
  'mphiri',
  'mphiri@mansa.gov.zm',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'clerk'
);

-- Sample Viewer
INSERT INTO users (full_name, username, email, password_hash, role)
VALUES (
  'John Mwale',
  'jmwale',
  'jmwale@mansa.gov.zm',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'viewer'
);

-- Sample Citizens
INSERT INTO citizens (nrc_number, first_name, last_name, date_of_birth, gender, phone, address, ward, status, created_by)
VALUES
  ('123456/78/1', 'Chanda', 'Mutale', '1985-03-12', 'Male', '0977123456', 'Plot 5, Mansa Township', 'Central Ward', 'Active', 1),
  ('234567/89/2', 'Grace', 'Banda', '1992-07-20', 'Female', '0966234567', 'House 12, New Mufulira', 'North Ward', 'Active', 1),
  ('345678/90/3', 'Peter', 'Tembo', '1978-11-05', 'Male', '0955345678', 'Plot 88, Mansa East', 'East Ward', 'Active', 1);

-- Sample Land Records
INSERT INTO land_records (plot_number, owner_nrc, owner_name, owner_phone, location, ward, area_sqm, land_use, status, registered_date, created_by)
VALUES
  ('PLOT/MSA/001', '123456/78/1', 'Chanda Mutale', '0977123456', 'Mansa Township, Block A', 'Central Ward', 450.00, 'Residential', 'Active', '2018-05-10', 1),
  ('PLOT/MSA/002', '234567/89/2', 'Grace Banda', '0966234567', 'New Mufulira, Stand 12', 'North Ward', 600.00, 'Commercial', 'Active', '2019-08-22', 1),
  ('PLOT/MSA/003', NULL, 'Mansa Council', NULL, 'Industrial Area, Zone 3', 'South Ward', 2000.00, 'Industrial', 'Active', '2010-01-15', 1);

-- Sample Business Licences
INSERT INTO business_licences (licence_number, business_name, owner_nrc, owner_name, business_type, address, ward, phone, status, issue_date, expiry_date, created_by)
VALUES
  ('BL/MSA/2024/001', 'Mutale General Dealers', '123456/78/1', 'Chanda Mutale', 'Retail Shop', 'Shop 3, Mansa Market', 'Central Ward', '0977123456', 'Active', '2024-01-01', '2024-12-31', 1),
  ('BL/MSA/2024/002', 'Grace Hair & Beauty', '234567/89/2', 'Grace Banda', 'Salon', 'New Mufulira, Stand 12', 'North Ward', '0966234567', 'Active', '2024-03-01', '2025-02-28', 1),
  ('BL/MSA/2023/010', 'Tembo Pharmacy', '345678/90/3', 'Peter Tembo', 'Pharmacy', 'Mansa East Road', 'East Ward', '0955345678', 'Expired', '2023-01-01', '2023-12-31', 1);
