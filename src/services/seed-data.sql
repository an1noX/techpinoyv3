
-- Admin Users
INSERT INTO users (id, email, password_hash, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@printpal.com', '$2a$10$kV7X.lfAVHoH5eSucBN8jOVXu/5xgkEAvPJSHtQOwoJ6bEBvA4DyS', NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'manager@printpal.com', '$2a$10$kV7X.lfAVHoH5eSucBN8jOVXu/5xgkEAvPJSHtQOwoJ6bEBvA4DyS', NOW(), NOW());

-- User Profiles
INSERT INTO profiles (id, first_name, last_name, role, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin', 'User', 'admin', NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'Manager', 'User', 'manager', NOW(), NOW());

-- Clients
INSERT INTO clients (id, name, company, email, phone, address, notes)
VALUES
('c1000000-0000-0000-0000-000000000001', 'Acme Corp', 'Acme Corporation', 'contact@acme.com', '555-123-4567', '123 Acme Street, Acme City', 'Key account since 2020'),
('c1000000-0000-0000-0000-000000000002', 'TechSolutions Inc', 'TechSolutions', 'info@techsolutions.com', '555-987-6543', '456 Tech Blvd, Innovation Valley', 'Prefers HP printers'),
('c1000000-0000-0000-0000-000000000003', 'Global Enterprises', 'Global Inc', 'global@enterprises.com', '555-456-7890', '789 Global Avenue, Metropolis', 'Multiple locations');

-- Wiki Printers (Model catalog)
INSERT INTO printer_wiki (id, make, model, series, specs, maintenance_tips)
VALUES
('w1000000-0000-0000-0000-000000000001', 'HP', 'Pro MFP M428fdn', 'LaserJet', '{"resolution":"1200 x 1200 dpi","paperSize":"A4, Letter, Legal","connectivity":"USB, Ethernet, WiFi","printSpeed":"40 ppm"}', 'Replace toner when low, clean monthly.'),
('w1000000-0000-0000-0000-000000000002', 'Brother', 'L8900CDW', 'MFC', '{"resolution":"2400 x 600 dpi","paperSize":"A4, Letter, Legal","connectivity":"USB, Ethernet, WiFi, NFC","printSpeed":"33 ppm"}', 'Check drum unit every 15,000 pages.'),
('w1000000-0000-0000-0000-000000000003', 'Canon', '1643i', 'imageRUNNER', '{"resolution":"600 x 600 dpi","paperSize":"A4, Letter, Legal","connectivity":"USB, Ethernet","printSpeed":"43 ppm"}', 'Regular firmware updates recommended.');

-- Actual Printers
INSERT INTO printers (id, make, model, series, status, owned_by, assigned_to, client_id, department, location, is_for_rent)
VALUES
('p1000000-0000-0000-0000-000000000001', 'HP', 'Pro MFP M428fdn', 'LaserJet', 'available', 'system', NULL, NULL, 'Marketing', 'Floor 2, Room 201', TRUE),
('p1000000-0000-0000-0000-000000000002', 'Brother', 'L8900CDW', 'MFC', 'rented', 'system', 'Acme Corp', 'c1000000-0000-0000-0000-000000000001', 'Sales', 'Floor 1, Room 105', TRUE),
('p1000000-0000-0000-0000-000000000003', 'Canon', '1643i', 'imageRUNNER', 'maintenance', 'client', 'TechSolutions Inc', 'c1000000-0000-0000-0000-000000000002', 'IT', 'Floor 3, Room 302', FALSE);

-- Printer Client Assignments
INSERT INTO printer_client_assignments (id, printer_id, client_id, assigned_at, notes, created_by)
VALUES
('a1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', NOW(), 'Long-term assignment', '00000000-0000-0000-0000-000000000001'),
('a1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', NOW(), 'Temporary assignment for project', '00000000-0000-0000-0000-000000000001');

-- Rental Options
INSERT INTO rental_options (id, printer_id, rental_rate, rate_unit, minimum_duration, duration_unit, security_deposit, terms, cancellation_policy, is_for_rent)
VALUES
('r1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 75.00, 'daily', 7, 'days', 200.00, 'Standard rental terms apply.', 'Cancellation allowed up to 48 hours prior to start date.', TRUE),
('r1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 60.00, 'daily', 5, 'days', 150.00, 'Standard rental terms apply.', 'Cancellation allowed up to 48 hours prior to start date.', TRUE);

-- Rentals
INSERT INTO rentals (id, printer_id, printer, client_id, client, start_date, end_date, status, inquiry_count, booking_count, next_available_date)
VALUES
('b1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'HP LaserJet Pro MFP M428fdn', 'c1000000-0000-0000-0000-000000000001', 'Acme Corp', '2025-04-10', '2025-06-10', 'active', 3, 1, '2025-06-11'),
('b1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 'Brother MFC L8900CDW', 'c1000000-0000-0000-0000-000000000002', 'TechSolutions Inc', '2025-03-15', '2025-05-15', 'active', 2, 1, '2025-05-16');

-- Toners
INSERT INTO toners (id, brand, model, color, page_yield, stock, threshold, compatible_printers)
VALUES
('t1000000-0000-0000-0000-000000000001', 'HP', 'CF258A', 'Black', 3000, 10, 3, '["HP LaserJet Pro MFP M428fdn"]'),
('t1000000-0000-0000-0000-000000000002', 'Brother', 'TN-436BK', 'Black', 6500, 5, 2, '["Brother MFC L8900CDW"]'),
('t1000000-0000-0000-0000-000000000003', 'Brother', 'TN-436C', 'Cyan', 6500, 3, 1, '["Brother MFC L8900CDW"]'),
('t1000000-0000-0000-0000-000000000004', 'Canon', 'C-EXV56BK', 'Black', 30000, 2, 1, '["Canon imageRUNNER 1643i"]');
