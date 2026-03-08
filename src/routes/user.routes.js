const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const asyncHandler = require('../middlewares/asyncHandler');

router.post('/registrar', asyncHandler(UserController.registrar));
router.post('/login', asyncHandler(UserController.login));

module.exports = router;
