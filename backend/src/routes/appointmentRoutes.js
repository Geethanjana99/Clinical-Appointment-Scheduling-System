const express = require('express');
const router = express.Router();

// Get all appointments
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Appointments endpoint working',
        data: []
    });
});

// Create appointment
router.post('/', (req, res) => {
    res.json({
        success: true,
        message: 'Appointment created successfully',
        data: {}
    });
});

module.exports = router;
