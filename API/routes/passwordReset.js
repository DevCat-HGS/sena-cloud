const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// Ruta para solicitar código de recuperación
router.post('/request', passwordResetController.requestPasswordReset);

// Ruta para verificar código
router.post('/verify-code', passwordResetController.verifyResetCode);

// Ruta para cambiar contraseña
router.post('/reset', passwordResetController.resetPassword);

module.exports = router;