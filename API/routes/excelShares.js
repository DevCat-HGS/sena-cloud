const express = require('express');
const router = express.Router();
const excelShareController = require('../controllers/excelShareController');
const auth = require('../middleware/auth');

// Enviar archivo Excel a usuarios
router.post('/send', auth.verifyToken, excelShareController.sendExcelToUsers);

// Obtener archivos Excel recibidos por un usuario
router.get('/received/:userId', auth.verifyToken, excelShareController.getReceivedExcels);

// Marcar archivo Excel como leído
router.put('/read/:shareId', auth.verifyToken, excelShareController.markExcelAsRead);

module.exports = router;