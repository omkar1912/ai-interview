const express = require('express');
const { getProfile, updateProfile, getUserStats } = require('../controllers/user.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/stats', getUserStats);

module.exports = router;