const express = require('express');
const router = express.Router();

// Service Label
router.get('/', (req, res) => res.send("TP/EP Core Microservice"));

router.use('/core',require('./coreRoutes'));

module.exports = router;