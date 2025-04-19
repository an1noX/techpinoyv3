
-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sessions table for managing authentication sessions
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Profiles table for user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  first_name VARCHAR(255) NULL,
  last_name VARCHAR(255) NULL,
  department VARCHAR(255) NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(255) NULL,
  address TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Printers table
CREATE TABLE IF NOT EXISTS printers (
  id CHAR(36) PRIMARY KEY,
  make VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  series VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  owned_by VARCHAR(255) NOT NULL,
  assigned_to VARCHAR(255) NULL,
  client_id CHAR(36) NULL,
  department VARCHAR(255) NULL,
  location VARCHAR(255) NULL,
  is_for_rent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Printer Wiki table
CREATE TABLE IF NOT EXISTS printer_wiki (
  id CHAR(36) PRIMARY KEY,
  make VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  series VARCHAR(255) NOT NULL,
  specs JSON NULL,
  maintenance_tips TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id CHAR(36) PRIMARY KEY,
  printer_id CHAR(36) NULL,
  printer VARCHAR(255) NOT NULL,
  client_id CHAR(36) NULL,
  client VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  agreement_url VARCHAR(255) NULL,
  signature_url VARCHAR(255) NULL,
  booking_count INT NULL,
  inquiry_count INT NULL,
  next_available_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE SET NULL
);

-- Rental Options table
CREATE TABLE IF NOT EXISTS rental_options (
  id CHAR(36) PRIMARY KEY,
  printer_id CHAR(36) NOT NULL,
  rental_rate DECIMAL(10,2) NOT NULL,
  rate_unit VARCHAR(50) NOT NULL,
  minimum_duration INT NOT NULL,
  duration_unit VARCHAR(50) NOT NULL,
  security_deposit DECIMAL(10,2) NOT NULL,
  terms TEXT NULL,
  cancellation_policy TEXT NULL,
  availability JSON NULL,
  is_for_rent BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
);

-- Printer Client Assignments table
CREATE TABLE IF NOT EXISTS printer_client_assignments (
  id CHAR(36) PRIMARY KEY,
  printer_id CHAR(36) NOT NULL,
  client_id CHAR(36) NOT NULL,
  assigned_at TIMESTAMP NOT NULL,
  unassigned_at TIMESTAMP NULL,
  notes TEXT NULL,
  created_by CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Toners table
CREATE TABLE IF NOT EXISTS toners (
  id CHAR(36) PRIMARY KEY,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL,
  page_yield INT NOT NULL,
  stock INT DEFAULT 0,
  threshold INT DEFAULT 5,
  compatible_printers JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial admin user creation
-- Note: Password is 'admin123' - this is for development only
-- In production, you should create users securely
INSERT INTO users (id, email, password_hash, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@printpal.com', '$2a$10$kV7X.lfAVHoH5eSucBN8jOVXu/5xgkEAvPJSHtQOwoJ6bEBvA4DyS', NOW(), NOW());

INSERT INTO profiles (id, first_name, last_name, role, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Admin', 'User', 'admin', NOW(), NOW());
