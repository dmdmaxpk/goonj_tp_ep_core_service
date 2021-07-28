const express = require('express');
const router = express.Router();

// Service Label
router.get('/', (req, res) => res.send("Goonj OTP Microservice"));

router.use('/payment',    require('./paymentRoute'));
router.use('/otp',    require('./otpRoutes'));

module.exports = router;