const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const authGuard = require('../middleware/authGuard');

router.post('/login', login);
router.post('/register', register);
router.get('/me', authGuard, getMe);

module.exports = router;
