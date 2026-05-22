const express = require('express');
const { uploadResume, uploadProfilePicture } = require('../controllers/upload.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(auth);

router.post('/resume', upload.single('resume'), uploadResume);
router.post('/profile-picture', upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;