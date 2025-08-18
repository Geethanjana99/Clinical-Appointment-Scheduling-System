const express = require('express');
const router = express.Router();

// Get all users
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Users endpoint working',
        data: []
    });
});

// Get user by ID
router.get('/:id', (req, res) => {
    res.json({
        success: true,
        message: 'User details endpoint working',
        data: {}
    });
});

module.exports = router;
