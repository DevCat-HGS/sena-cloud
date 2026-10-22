const express = require('express');
const router = express.Router();
const docShareController = require('../controllers/docShareController');
const auth = require('../middleware/auth');
const DocShare = require('../models/DocShare');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Directorio de almacenamiento
const uploadDir = path.join(__dirname, '../storage/uploads');

// Ruta para descargar documentos
router.get('/download/:fileId', auth.verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;
    
    // Buscar el documento compartido
    const docShare = await DocShare.findOne({
      _id: fileId,
      recipientId: userId
    });
    
    if (!docShare) {
      return res.status(404).json({ message: 'Documento no encontrado o no tienes permiso para acceder' });
    }
    
    const filePath = path.join(uploadDir, docShare.filePath);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'El archivo físico no se encuentra en el servidor' });
    }
    
    // Marcar como leído si aún no lo está
    if (!docShare.isRead) {
      docShare.isRead = true;
      docShare.readDate = new Date();
      await docShare.save();
    }
    
    // Enviar el archivo como descarga
    res.download(filePath, docShare.fileName, (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        return res.status(500).json({ message: 'Error al descargar el archivo' });
      }
    });
  } catch (error) {
    console.error('Error en la descarga del documento:', error);
    res.status(500).json({ message: 'Error al procesar la descarga del documento' });
  }
});

// Enviar archivo Word/PDF a usuarios
router.post('/send', docShareController.sendDocToUsers);

// Obtener documentos recibidos por el usuario actual
router.get('/received', auth.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar todos los documentos compartidos con este usuario
    const receivedDocs = await DocShare.find({ 
      recipientId: userId 
    }).populate('sharedBy', 'name email');
    
    return res.status(200).json(receivedDocs);
  } catch (error) {
    console.error('Error al obtener documentos recibidos:', error);
    return res.status(500).json({ message: 'Error al obtener documentos recibidos' });
  }
});

// Enviar archivo por nombre a instructores
router.post('/send/:fileName', auth.verifyToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    const { instructorIds } = req.body;
    
    console.log('Datos recibidos:', { fileName, instructorIds, body: req.body });
    
    if (!instructorIds || !Array.isArray(instructorIds) || instructorIds.length === 0) {
      return res.status(400).json({ message: 'Se requiere al menos un instructor como destinatario en formato array' });
    }
    
    // Verificar que el archivo existe en el sistema de archivos
    const filePath = path.join(uploadDir, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado en el sistema' });
    }
    
    // Determinar el tipo de archivo
    const fileExtension = path.extname(fileName).toLowerCase();
    let fileType;
    if (fileExtension === '.pdf') {
      fileType = 'pdf';
    } else if (['.doc', '.docx'].includes(fileExtension)) {
      fileType = 'word';
    } else {
      fileType = 'other';
    }
    
    // Convertir a array si es un solo ID
    const recipientIds = Array.isArray(instructorIds) ? instructorIds : [instructorIds];
    
    // Verificar que los instructores existen y están aprobados
    const instructors = await User.find({ 
      _id: { $in: recipientIds },
      rol: 'Instructor',
      estadoInstructor: 'aprobado'
    });
    
    if (instructors.length === 0) {
      return res.status(400).json({ message: 'No se encontraron instructores válidos' });
    }
    
    // Crear registros de compartición para cada instructor
    const shares = [];
    for (const instructor of instructors) {
      const share = new DocShare({
        fileId: path.basename(fileName, fileExtension),
        fileName: fileName,
        fileType: fileType,
        filePath: fileName,
        senderId: req.user.id,
        recipientId: instructor._id,
        isRead: false
      });
      
      await share.save();
      shares.push(share);
    }
    
    res.status(201).json({ 
      message: 'Archivo compartido exitosamente con los instructores seleccionados',
      shares
    });
  } catch (error) {
    console.error('Error al compartir archivo con instructores:', error);
    res.status(500).json({ message: error.message });
  }
});

// Enviar archivo existente a instructores
router.post('/send/:fileId', auth.verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { instructorIds } = req.body;
    
    if (!instructorIds || !Array.isArray(instructorIds) || instructorIds.length === 0) {
      return res.status(400).json({ message: 'Se requiere al menos un instructor como destinatario' });
    }
    
    // Verificar que el archivo existe
    const docShare = await DocShare.findById(fileId);
    if (!docShare) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    // Verificar que los instructores existen y están aprobados
    const instructors = await User.find({ 
      _id: { $in: instructorIds },
      rol: 'Instructor',
      estadoInstructor: 'aprobado'
    });
    
    if (instructors.length === 0) {
      return res.status(400).json({ message: 'No se encontraron instructores válidos' });
    }
    
    // Crear registros de compartición para cada instructor
    const shares = [];
    for (const instructor of instructors) {
      const share = new DocShare({
        fileId: docShare.fileId || fileId,
        fileName: docShare.fileName,
        filePath: docShare.filePath,
        fileType: docShare.fileType,
        fileSize: docShare.fileSize,
        senderId: req.user.id,
        recipientId: instructor._id,
        isRead: false
      });
      
      await share.save();
      shares.push(share);
    }
    
    res.status(201).json({ 
      message: 'Archivo compartido exitosamente con los instructores seleccionados',
      shares
    });
  } catch (error) {
    console.error('Error al compartir archivo con instructores:', error);
    res.status(500).json({ message: error.message });
  }
});

// Subir archivo sin enviar a destinatarios
router.post('/upload', auth.verifyToken, docShareController.uploadDoc);

// Obtener archivos Word/PDF recibidos por un usuario
router.get('/received/:userId', auth.verifyToken, docShareController.getReceivedDocs);

// Obtener archivos Word/PDF enviados por un usuario
router.get('/sent/:userId', auth.verifyToken, docShareController.getSentDocs);

// Obtener documentos subidos por un usuario
router.get('/user/:userId', auth.verifyToken, docShareController.getUserDocs);

// Marcar archivo Word/PDF como leído
router.put('/read/:shareId', auth.verifyToken, docShareController.markDocAsRead);

// Descargar archivo Word/PDF
router.get('/download/:fileId', auth.verifyToken, docShareController.downloadDoc);

// Nuevas rutas para gestión de archivos
router.get('/files', auth.verifyToken, docShareController.listAllFiles);
router.get('/all', auth.verifyToken, docShareController.getAllSharedDocs);
router.put('/rename', auth.verifyToken, docShareController.renameFile);
router.delete('/delete/:fileName', auth.verifyToken, docShareController.deleteFile);

module.exports = router;