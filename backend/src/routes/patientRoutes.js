const express = require('express');
const router = express.Router();

// Get all patients
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Patients endpoint working',
        data: []
    });
});

module.exports = router;
