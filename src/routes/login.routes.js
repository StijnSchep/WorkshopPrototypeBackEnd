const express = require('express');
const router = express.Router();
const authController = require('../controllers/authentication.controller');

router.post('/validate', authController.standaloneValidateToken);
router.post('/auth', authController.loginAdmin);
router.post('/check', authController.contactRegistreeCheck);
router.post('/auth/admin', authController.createAdmin);

module.exports = router;