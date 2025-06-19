const express = require('express');
const router = express.Router();

// Get all doctors
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Doctors endpoint working',
        data: []
    });
});

module.exports = router;
