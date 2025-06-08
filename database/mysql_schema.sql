# MySQL Database Schema for Clinical Appointment Scheduling System

This document outlines the MySQL database structure for the Clinical Appointment Scheduling System, handling user management, appointments, billing, and administrative data.

## Overview
MySQL is used for relational data that requires ACID compliance, complex relationships, and transactional integrity.

---

## Database Schema

### 1. Users Table
Stores all system users with role-based access

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin', 'billing') NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);
```

---

### 2. Patients Table
Extended information for patient users

```sql
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(20) UNIQUE NOT NULL, -- P001, P002, etc.
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    blood_type VARCHAR(5),
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    occupation VARCHAR(255),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    preferred_language VARCHAR(50) DEFAULT 'English',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);
```

---

### 3. Doctors Table
Extended information for doctor users

```sql
CREATE TABLE doctors (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(20) UNIQUE NOT NULL, -- D001, D002, etc.
    specialty VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    years_of_experience INT,
    education TEXT,
    certifications TEXT,
    consultation_fee DECIMAL(10,2),
    languages_spoken JSON, -- ["English", "Spanish", "French"]
    office_address TEXT,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    working_hours JSON, -- {"monday": {"start": "09:00", "end": "17:00"}, ...}
    availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    commission_rate DECIMAL(5,2) DEFAULT 25.00, -- percentage
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_user_id (user_id),
    INDEX idx_specialty (specialty),
    INDEX idx_status (status),
    INDEX idx_rating (rating)
);
```

---

### 4. Doctor Availability Table
Manages doctor schedules and availability

```sql
CREATE TABLE doctor_availability (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    doctor_id VARCHAR(36) NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INT DEFAULT 30, -- minutes per appointment
    max_appointments_per_slot INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_day_of_week (day_of_week),
    INDEX idx_effective_date (effective_date),
    
    UNIQUE KEY unique_doctor_day_time (doctor_id, day_of_week, start_time, end_time, effective_date)
);
```

---

### 5. Appointments Table
Core appointment management

```sql
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    appointment_id VARCHAR(20) UNIQUE NOT NULL, -- APT-001, APT-002, etc.
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT DEFAULT 30, -- minutes
    appointment_type ENUM('consultation', 'follow-up', 'emergency', 'routine-checkup') NOT NULL,
    status ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
    reason_for_visit TEXT,
    symptoms TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(36), -- user_id who cancelled
    cancelled_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    estimated_wait_time INT, -- minutes
    actual_wait_time INT, -- minutes
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_appointment_datetime (appointment_date, appointment_time),
    
    UNIQUE KEY unique_doctor_datetime (doctor_id, appointment_date, appointment_time)
);
```

---

### 6. Appointment Queue Table
Real-time queue management

```sql
CREATE TABLE appointment_queue (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    appointment_id VARCHAR(36) NOT NULL,
    queue_position INT NOT NULL,
    estimated_wait_time INT, -- minutes
    actual_wait_time INT, -- minutes
    queue_status ENUM('waiting', 'in-consultation', 'completed', 'missed') DEFAULT 'waiting',
    checked_in_at TIMESTAMP,
    called_at TIMESTAMP,
    consultation_started_at TIMESTAMP,
    consultation_ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_queue_status (queue_status),
    INDEX idx_queue_position (queue_position),
    INDEX idx_checked_in_at (checked_in_at)
);
```

---

### 7. Billing and Invoices Table
Financial transaction management

```sql
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_id VARCHAR(20) UNIQUE NOT NULL, -- INV-001, INV-002, etc.
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_id VARCHAR(36),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    outstanding_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    payment_method ENUM('cash', 'credit_card', 'insurance', 'bank_transfer', 'other'),
    payment_reference VARCHAR(255),
    paid_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_invoice_date (invoice_date),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);
```

---

### 8. Invoice Items Table
Detailed billing line items

```sql
CREATE TABLE invoice_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_id VARCHAR(36) NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_service_type (service_type)
);
```

---

### 9. Insurance Claims Table
Insurance claim management

```sql
CREATE TABLE insurance_claims (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    claim_id VARCHAR(20) UNIQUE NOT NULL, -- CLM-001, CLM-002, etc.
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_id VARCHAR(36),
    invoice_id VARCHAR(36),
    insurance_provider VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100),
    claim_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    service_date DATE NOT NULL,
    claim_date DATE NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    status ENUM('pending', 'processing', 'approved', 'paid', 'denied', 'cancelled') DEFAULT 'pending',
    denial_reason TEXT,
    pre_authorization_number VARCHAR(100),
    claim_reference VARCHAR(255),
    processed_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    
    INDEX idx_claim_id (claim_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_insurance_provider (insurance_provider),
    INDEX idx_status (status),
    INDEX idx_claim_date (claim_date),
    INDEX idx_service_date (service_date)
);
```

---

### 10. Doctor Reviews Table
Patient feedback and ratings

```sql
CREATE TABLE doctor_reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_id VARCHAR(36),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating INT CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    facility_rating INT CHECK (facility_rating >= 1 AND facility_rating <= 5),
    would_recommend BOOLEAN,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    UNIQUE KEY unique_patient_appointment_review (patient_id, appointment_id)
);
```

---

### 11. System Settings Table
Application configuration

```sql
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);
```

---

### 12. Audit Log Table
System activity tracking

```sql
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(255),
    record_id VARCHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);
```

---

### 13. Notifications Table
System notifications management

```sql
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    category ENUM('appointment', 'billing', 'system', 'reminder') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    metadata JSON,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
);
```

---

## Views for Common Queries

### Patient Dashboard View
```sql
CREATE VIEW patient_dashboard AS
SELECT 
    p.id,
    p.patient_id,
    u.name,
    u.email,
    p.status,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
    COUNT(DISTINCT CASE WHEN a.status IN ('scheduled', 'confirmed') AND a.appointment_date >= CURDATE() THEN a.id END) as upcoming_appointments,
    MAX(a.appointment_date) as last_appointment_date,
    SUM(DISTINCT i.outstanding_amount) as outstanding_amount
FROM patients p
JOIN users u ON p.user_id = u.id
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN invoices i ON p.id = i.patient_id AND i.status != 'paid'
WHERE p.status = 'active'
GROUP BY p.id, p.patient_id, u.name, u.email, p.status;
```

### Doctor Dashboard View
```sql
CREATE VIEW doctor_dashboard AS
SELECT 
    d.id,
    d.doctor_id,
    u.name,
    d.specialty,
    d.rating,
    d.total_reviews,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.appointment_date = CURDATE() THEN a.id END) as today_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'scheduled' AND a.appointment_date >= CURDATE() THEN a.id END) as upcoming_appointments,
    SUM(DISTINCT ic.approved_amount) as total_commission_earnings,
    AVG(dr.rating) as average_rating
FROM doctors d
JOIN users u ON d.user_id = u.id
LEFT JOIN appointments a ON d.id = a.doctor_id
LEFT JOIN insurance_claims ic ON d.id = ic.doctor_id AND ic.status = 'paid'
LEFT JOIN doctor_reviews dr ON d.id = dr.doctor_id AND dr.status = 'approved'
WHERE d.status = 'active'
GROUP BY d.id, d.doctor_id, u.name, d.specialty, d.rating, d.total_reviews;
```

---

## Stored Procedures

### Update Doctor Rating
```sql
DELIMITER //
CREATE PROCEDURE UpdateDoctorRating(IN doctor_id VARCHAR(36))
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE review_count INT;
    
    SELECT AVG(rating), COUNT(*) 
    INTO avg_rating, review_count
    FROM doctor_reviews 
    WHERE doctor_id = doctor_id AND status = 'approved';
    
    UPDATE doctors 
    SET rating = COALESCE(avg_rating, 0.00), 
        total_reviews = review_count 
    WHERE id = doctor_id;
END //
DELIMITER ;
```

### Calculate Monthly Revenue
```sql
DELIMITER //
CREATE PROCEDURE CalculateMonthlyRevenue(
    IN target_month INT,
    IN target_year INT,
    OUT total_revenue DECIMAL(10,2),
    OUT total_appointments INT,
    OUT average_fee DECIMAL(10,2)
)
BEGIN
    SELECT 
        SUM(consultation_fee),
        COUNT(*),
        AVG(consultation_fee)
    INTO total_revenue, total_appointments, average_fee
    FROM appointments 
    WHERE YEAR(appointment_date) = target_year 
    AND MONTH(appointment_date) = target_month
    AND status = 'completed';
END //
DELIMITER ;
```

---

## Triggers

### Update Outstanding Amount on Payment
```sql
DELIMITER //
CREATE TRIGGER update_outstanding_amount
AFTER UPDATE ON invoices
FOR EACH ROW
BEGIN
    IF NEW.paid_amount != OLD.paid_amount THEN
        UPDATE invoices 
        SET outstanding_amount = total_amount - paid_amount
        WHERE id = NEW.id;
    END IF;
END //
DELIMITER ;
```

### Log Appointment Changes
```sql
DELIMITER //
CREATE TRIGGER log_appointment_changes
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action, table_name, record_id, old_values, new_values)
    VALUES (
        'UPDATE',
        'appointments',
        NEW.id,
        JSON_OBJECT('status', OLD.status, 'appointment_date', OLD.appointment_date),
        JSON_OBJECT('status', NEW.status, 'appointment_date', NEW.appointment_date)
    );
END //
DELIMITER ;
```

---

## Initial Data Setup

### Default System Settings
```sql
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('appointment_slot_duration', '30', 'number', 'Default appointment duration in minutes', TRUE),
('max_appointments_per_day', '20', 'number', 'Maximum appointments per doctor per day', FALSE),
('consultation_fee_default', '150.00', 'number', 'Default consultation fee', FALSE),
('system_timezone', 'America/New_York', 'string', 'System timezone', TRUE),
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', TRUE),
('sms_notifications_enabled', 'true', 'boolean', 'Enable SMS notifications', TRUE),
('appointment_reminder_hours', '24', 'number', 'Hours before appointment to send reminder', TRUE),
('max_cancellation_hours', '24', 'number', 'Hours before appointment when cancellation is allowed', TRUE);
```

---

## Performance Optimization

### Partitioning for Large Tables
```sql
-- Partition appointments table by year
ALTER TABLE appointments 
PARTITION BY RANGE (YEAR(appointment_date)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION pfuture VALUES LESS THAN MAXVALUE
);
```

### Additional Indexes for Performance
```sql
-- Composite indexes for common queries
CREATE INDEX idx_appointments_doctor_date_status ON appointments(doctor_id, appointment_date, status);
CREATE INDEX idx_invoices_patient_status_date ON invoices(patient_id, status, invoice_date);
CREATE INDEX idx_claims_provider_status_date ON insurance_claims(insurance_provider, status, claim_date);
```

This comprehensive MySQL schema provides a solid foundation for the Clinical Appointment Scheduling System with proper relationships, constraints, and performance optimizations.
