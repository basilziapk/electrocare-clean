-- ElectroCare Solar Management System Database Migration
-- Complete Schema and Data Dump
-- Generated: August 15, 2025

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS installations CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    profile_image_url TEXT,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Services table
CREATE TABLE services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(12,2),
    base_price DECIMAL(12,2),
    duration TEXT,
    requirements TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Technicians table
CREATE TABLE technicians (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    specializations TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Quotations table
CREATE TABLE quotations (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    service_id TEXT REFERENCES services(id),
    service_name TEXT,
    system_size DECIMAL(8,2),
    estimated_cost DECIMAL(12,2),
    estimated_savings DECIMAL(12,2),
    payback_period INTEGER,
    installation_timeline TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Installations table
CREATE TABLE installations (
    id TEXT PRIMARY KEY,
    quotation_id TEXT NOT NULL REFERENCES quotations(id),
    customer_id TEXT NOT NULL REFERENCES users(id),
    technician_id TEXT REFERENCES technicians(id),
    service_id TEXT REFERENCES services(id),
    status TEXT DEFAULT 'scheduled',
    installation_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Complaints table
CREATE TABLE complaints (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    technician_id TEXT REFERENCES technicians(id),
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Tickets table
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    assignee_id TEXT REFERENCES users(id),
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Sessions table for authentication
CREATE TABLE sessions (
    sid TEXT PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX "IDX_session_expire" ON sessions ("expire");

-- Insert Users data
INSERT INTO users (id, email, first_name, last_name, profile_image_url, phone, address, role, status, created_at, updated_at) VALUES
('admin-001', 'admin@electrocare.com', 'Admin', 'User', NULL, NULL, NULL, 'admin', 'active', '2025-08-13 23:14:06.410+00', '2025-08-13 23:14:06.410+00'),
('user-001', 'ahmed.khan@gmail.com', 'Ahmed', 'Khan', NULL, '+92-300-1234567', 'Block A, Model Town, Lahore', 'customer', 'active', '2025-08-13 23:14:06.410+00', '2025-08-13 23:14:06.410+00'),
('user-002', 'fatima.ali@hotmail.com', 'Fatima', 'Ali', NULL, '+92-321-7654321', 'Sector F-8, Islamabad', 'customer', 'active', '2025-08-13 23:14:06.410+00', '2025-08-13 23:14:06.410+00'),
('user-003', 'muhammad.hassan@yahoo.com', 'Muhammad', 'Hassan', NULL, '+92-333-9876543', 'Clifton Block 5, Karachi', 'customer', 'active', '2025-08-13 23:14:06.410+00', '2025-08-13 23:14:06.410+00'),
('tech-001', 'ali.khan@electrocare.com', 'Ali', 'Khan', NULL, '+92-300-1111111', 'Tech Street, Lahore', 'technician', 'active', '2025-08-13 23:14:06.410+00', '2025-08-13 23:14:06.410+00'),
('tech-002', 'jawad.malik@electrocare.com', 'Jawad', 'Malik', NULL, '+92-321-2222222', 'Industrial Area, Faisalabad', 'technician', 'active', '2025-08-13 23:14:06.410+00', '2025-08-13 23:14:06.410+00');

-- Insert Services data
INSERT INTO services (id, name, description, category, price, base_price, duration, requirements, is_active, created_at, updated_at) VALUES
('srv-001', 'Residential Solar Installation', 'Complete solar panel installation for homes including panels, inverter, and monitoring system', 'installation', 450000.00, NULL, '2-3 days', NULL, true, '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('srv-002', 'Commercial Solar Setup', 'Large-scale solar installation for commercial buildings and warehouses', 'installation', 2250000.00, NULL, '1-2 weeks', NULL, true, '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('srv-003', 'Solar System Maintenance', 'Annual maintenance package including cleaning, inspection, and performance optimization', 'maintenance', 15000.00, NULL, '4 hours', NULL, true, '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('srv-004', 'Battery Storage Installation', 'Add battery backup system to existing solar installation', 'installation', 240000.00, NULL, '1 day', NULL, true, '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('srv-005', 'Solar Consultation', 'Professional consultation for solar system sizing and ROI analysis', 'consultation', 6000.00, NULL, '2 hours', NULL, true, '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00');

-- Insert Technicians data
INSERT INTO technicians (id, user_id, name, email, phone, specializations, certifications, experience_years, rating, is_available, status, created_at, updated_at) VALUES
('tech-profile-001', 'tech-001', 'Ali Khan', 'ali.khan@electrocare.com', '+92-300-1111111', ARRAY['Solar Panel Installation', 'System Maintenance'], ARRAY[]::TEXT[], 5, 4.8, true, 'active', '2025-08-15 07:18:30.945+00', '2025-08-15 07:18:30.945+00'),
('tech-profile-002', 'tech-002', 'Jawad Malik', 'jawad.malik@electrocare.com', '+92-321-2222222', ARRAY['Solar Panel Installation', 'General Installation'], ARRAY[]::TEXT[], 3, 4.5, true, 'active', '2025-08-15 07:18:30.945+00', '2025-08-15 07:18:30.945+00');

-- Insert Quotations data  
INSERT INTO quotations (id, customer_id, customer_name, customer_email, customer_phone, customer_address, service_id, service_name, system_size, estimated_cost, estimated_savings, payback_period, installation_timeline, notes, status, created_at, updated_at) VALUES
('quote-001', 'user-001', 'Ahmed Khan', 'ahmed.khan@gmail.com', '+92-300-1234567', 'Block A, Model Town, Lahore', 'srv-001', 'Residential Solar Installation', 5.50, 450000.00, 8500.00, 60, '2-3 days', 'Standard residential installation', 'approved', '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('quote-002', 'user-002', 'Fatima Ali', 'fatima.ali@hotmail.com', '+92-321-7654321', 'Sector F-8, Islamabad', 'srv-002', 'Commercial Solar Setup', 25.00, 2250000.00, 35000.00, 75, '1-2 weeks', 'Large commercial installation', 'pending', '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('quote-003', 'user-003', 'Muhammad Hassan', 'muhammad.hassan@yahoo.com', '+92-333-9876543', 'Clifton Block 5, Karachi', 'srv-004', 'Battery Storage Installation', 8.00, 240000.00, 12000.00, 24, '1 day', 'Battery backup system', 'converted', '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00');

-- Insert Installations data
INSERT INTO installations (id, quotation_id, customer_id, technician_id, service_id, status, installation_date, completion_date, notes, created_at, updated_at) VALUES
('inst-001', 'quote-001', 'user-001', 'tech-profile-001', 'srv-001', 'completed', '2025-08-10 09:00:00+00', '2025-08-12 17:00:00+00', 'Installation completed successfully', '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('inst-002', 'quote-003', 'user-003', 'tech-profile-002', 'srv-004', 'in_progress', '2025-08-14 10:00:00+00', NULL, 'Battery installation in progress', '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00');

-- Insert Complaints data
INSERT INTO complaints (id, customer_id, customer_name, customer_email, customer_phone, title, description, category, priority, status, technician_id, resolution, resolved_at, created_at, updated_at) VALUES
('cmp-001', 'user-001', 'Ahmed Khan', 'ahmed.khan@gmail.com', '+92-300-1234567', 'Solar Panel Performance Issue', 'The solar panels are not generating expected power output', 'technical', 'high', 'open', NULL, NULL, NULL, '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('cmp-002', 'user-002', 'Fatima Ali', 'fatima.ali@hotmail.com', '+92-321-7654321', 'Installation Delay', 'Installation was scheduled for last week but technician did not arrive', 'service', 'medium', 'resolved', 'tech-profile-002', 'Rescheduled installation for next week. Apologized for inconvenience.', '2025-08-14 15:30:00+00', '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('cmp-003', 'user-003', 'Muhammad Hassan', 'muhammad.hassan@yahoo.com', '+92-333-9876543', 'Inverter Malfunction', 'Inverter showing error codes and not working properly', 'technical', 'high', 'in_progress', 'tech-profile-001', NULL, NULL, '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00');

-- Insert Tickets data
INSERT INTO tickets (id, customer_id, customer_name, customer_email, customer_phone, title, description, category, priority, status, assignee_id, resolution, resolved_at, created_at, updated_at) VALUES
('tk-001', 'user-001', 'Ahmed Khan', 'ahmed.khan@gmail.com', '+92-300-1234567', 'System Monitoring Setup', 'Need help setting up the mobile app for system monitoring', 'support', 'low', 'open', NULL, NULL, NULL, '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('tk-002', 'user-002', 'Fatima Ali', 'fatima.ali@hotmail.com', '+92-321-7654321', 'Billing Inquiry', 'Questions about net metering billing and credits', 'billing', 'medium', 'resolved', 'admin-001', 'Explained net metering process and provided billing breakdown', '2025-08-14 12:00:00+00', '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00'),
('tk-003', 'user-003', 'Muhammad Hassan', 'muhammad.hassan@yahoo.com', '+92-333-9876543', 'Warranty Information', 'Need warranty documents for recently installed system', 'documentation', 'low', 'closed', 'admin-001', 'Warranty documents emailed to customer', '2025-08-14 16:45:00+00', '2025-08-13 23:10:32.589+00', '2025-08-13 23:10:32.589+00');

-- Database setup complete for ElectroCare Solar Management System
