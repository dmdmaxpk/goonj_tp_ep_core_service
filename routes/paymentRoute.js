const express = require('express');
const router = express.Router();

const controller = require('../controllers/BillingController');

router.route('/api-token').get(controller.generateToken);
router.route('/charge').post(controller.charge);
router.route('/send-sms').post(controller.sendMessage);
router.route('/subscriber-query').post(controller.subscriberQuery);

module.exports = router;
