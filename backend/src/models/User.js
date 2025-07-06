const { query, queryOne } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.password = data.password; // Keep password for internal operations
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.role = data.role;
        this.phoneNumber = data.phoneNumber;
        this.isActive = data.isActive;
        this.emailVerified = data.emailVerified;
        this.lastLogin = data.lastLogin;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    // Create a new user
    static async create({ email, password, firstName, lastName, role = 'patient', phoneNumber = null }) {
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);
            
            // Insert user into database
            const sql = `
                INSERT INTO users (email, password, firstName, lastName, role, phoneNumber)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const result = await query(sql, [email, hashedPassword, firstName, lastName, role, phoneNumber]);
            
            // Get the created user
            const newUser = await User.findById(result.insertId);
            return newUser;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('User with this email already exists');
            }
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const userData = await queryOne(sql, [id]);
        
        if (!userData) return null;
        return new User(userData);
    }

    // Find user by email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const userData = await queryOne(sql, [email]);
        
        if (!userData) return null;
        return new User(userData);
    }    // Verify password
    async verifyPassword(password) {
        if (!this.password) {
            // If password is not loaded, fetch it from database
            const sql = 'SELECT password FROM users WHERE id = ?';
            const result = await queryOne(sql, [this.id]);
            if (!result) return false;
            this.password = result.password;
        }
        
        return await bcrypt.compare(password, this.password);
    }

    // Update last login
    async updateLastLogin() {
        const sql = 'UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?';
        await query(sql, [this.id]);
        this.lastLogin = new Date();
    }

    // Get all users (for admin)
    static async findAll(filters = {}) {
        let sql = 'SELECT * FROM users WHERE 1=1';
        const params = [];

        if (filters.role) {
            sql += ' AND role = ?';
            params.push(filters.role);
        }

        if (filters.isActive !== undefined) {
            sql += ' AND isActive = ?';
            params.push(filters.isActive);
        }

        sql += ' ORDER BY createdAt DESC';

        const usersData = await query(sql, params);
        return usersData.map(userData => new User(userData));
    }

    // Update user
    async update(updates) {
        const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'isActive', 'emailVerified'];
        const updateFields = [];
        const params = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                params.push(value);
            }
        }

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        params.push(this.id);
        const sql = `UPDATE users SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        
        await query(sql, params);
        
        // Refresh the user data
        const updatedUser = await User.findById(this.id);
        Object.assign(this, updatedUser);
        return this;
    }

    // Delete user (soft delete - set isActive to false)
    async delete() {
        const sql = 'UPDATE users SET isActive = false WHERE id = ?';
        await query(sql, [this.id]);
        this.isActive = false;
    }

    // Hard delete user
    async hardDelete() {
        const sql = 'DELETE FROM users WHERE id = ?';
        await query(sql, [this.id]);
    }

    // Get user with profile data
    async getWithProfile() {
        const sql = `
            SELECT 
                u.*,
                p.gender,
                p.dateOfBirth,
                p.address,
                p.emergencyContactName,
                p.emergencyContactPhone,
                p.preferredLanguage,
                p.specialization,
                p.licenseNumber,
                p.experienceYears,
                p.department,
                p.avatarUrl
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.userId
            WHERE u.id = ?
        `;
        
        const result = await queryOne(sql, [this.id]);
        return result;
    }

    // Create or update user profile
    async updateProfile(profileData) {
        const {
            gender,
            dateOfBirth,
            address,
            emergencyContactName,
            emergencyContactPhone,
            preferredLanguage,
            specialization,
            licenseNumber,
            experienceYears,
            department,
            avatarUrl
        } = profileData;

        // Check if profile exists
        const existingProfile = await queryOne('SELECT id FROM user_profiles WHERE userId = ?', [this.id]);

        if (existingProfile) {
            // Update existing profile
            const sql = `
                UPDATE user_profiles SET
                    gender = ?,
                    dateOfBirth = ?,
                    address = ?,
                    emergencyContactName = ?,
                    emergencyContactPhone = ?,
                    preferredLanguage = ?,
                    specialization = ?,
                    licenseNumber = ?,
                    experienceYears = ?,
                    department = ?,
                    avatarUrl = ?,
                    updatedAt = CURRENT_TIMESTAMP
                WHERE userId = ?
            `;
            
            await query(sql, [
                gender, dateOfBirth, address, emergencyContactName,
                emergencyContactPhone, preferredLanguage, specialization,
                licenseNumber, experienceYears, department, avatarUrl, this.id
            ]);
        } else {
            // Create new profile
            const sql = `
                INSERT INTO user_profiles (
                    userId, gender, dateOfBirth, address, emergencyContactName,
                    emergencyContactPhone, preferredLanguage, specialization,
                    licenseNumber, experienceYears, department, avatarUrl
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            await query(sql, [
                this.id, gender, dateOfBirth, address, emergencyContactName,
                emergencyContactPhone, preferredLanguage, specialization,
                licenseNumber, experienceYears, department, avatarUrl
            ]);
        }
    }

    // Convert to JSON (remove sensitive data)
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

module.exports = User;
