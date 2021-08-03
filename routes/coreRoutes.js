const express = require('express');
const router = express.Router();

const controller = require('../controllers/BillingController');

router.route('/api-token').get(controller.getToken);
router.route('/subscriber-query').get(controller.subscriberQuery);

router.route('/update-api-token').post(controller.updateToken);
router.route('/charge').post(controller.charge);
router.route('/send-sms').post(controller.sendMessage);
router.route('/send-ep-otp').post(controller.sendEpOtp);

module.exports = router;