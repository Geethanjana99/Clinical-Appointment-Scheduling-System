const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clinical_appointment_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`📊 Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Initialize database (create tables if they don't exist)
const initializeDatabase = async () => {
    try {
        // Create connection without specifying database
        const tempConfig = {
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
        
        const tempPool = mysql.createPool(tempConfig);
        const connection = await tempPool.getConnection();
        
        // Create database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log(`📊 Database '${dbConfig.database}' created/verified`);
        
        connection.release();
        tempPool.end();
        
        // Now use the main pool with the database specified
        const mainConnection = await pool.getConnection();
        
        // Create users table
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                firstName VARCHAR(100) NOT NULL,
                lastName VARCHAR(100) NOT NULL,
                role ENUM('patient', 'doctor', 'admin', 'nurse') NOT NULL DEFAULT 'patient',
                phoneNumber VARCHAR(20),
                isActive BOOLEAN DEFAULT true,
                emailVerified BOOLEAN DEFAULT false,
                lastLogin DATETIME,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_role (role),
                INDEX idx_active (isActive)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await mainConnection.execute(createUsersTable);
        console.log('✅ Users table created/verified successfully');
        
        // Create user_profiles table for additional information
        const createUserProfilesTable = `
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                gender ENUM('male', 'female', 'other'),
                dateOfBirth DATE,
                address TEXT,
                emergencyContactName VARCHAR(100),
                emergencyContactPhone VARCHAR(20),
                preferredLanguage VARCHAR(50) DEFAULT 'English',
                specialization VARCHAR(100),
                licenseNumber VARCHAR(100),
                experienceYears INT,
                department VARCHAR(100),
                avatarUrl VARCHAR(500),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_userId (userId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await mainConnection.execute(createUserProfilesTable);
        console.log('✅ User profiles table created/verified successfully');
        
        mainConnection.release();
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
};

// Execute raw SQL query
const query = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Get a single row
const queryOne = async (sql, params = []) => {
    const rows = await query(sql, params);
    return rows[0] || null;
};

module.exports = {
    pool,
    query,
    queryOne,
    testConnection,
    initializeDatabase
};
