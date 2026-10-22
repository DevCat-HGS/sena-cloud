const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// Subir archivo Excel
router.post('/upload', verifyToken, reportController.uploadExcel);

// Crear nuevo archivo Excel
router.post('/create', verifyToken, reportController.createExcel);

// Listar archivos Excel
router.get('/list', verifyToken, reportController.listExcelFiles);

// Obtener contenido de archivo Excel
router.get('/content/:filename', verifyToken, reportController.getExcelContent);

// Actualizar contenido de archivo Excel
router.put('/update/:filename', verifyToken, reportController.updateExcelContent);

// Descargar archivo Excel - Sin verificación de token para permitir descargas directas
router.get('/download/:filename', reportController.downloadExcel);

// Eliminar archivo Excel
router.delete('/delete/:filename', verifyToken, reportController.deleteExcel);

// Renombrar archivo Excel
router.put('/rename/:filename', verifyToken, reportController.renameExcel);

// Guardar datos de Luckysheet
router.put('/save-luckysheet/:filename', verifyToken, reportController.saveLuckysheetData);

// Obtener archivo Excel como buffer para Luckysheet
router.get('/file-buffer/:filename', verifyToken, reportController.getExcelFileBuffer);

module.exports = router;