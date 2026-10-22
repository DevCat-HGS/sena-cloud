const ExcelShare = require('../models/ExcelShare');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Enviar archivo Excel a usuarios
exports.sendExcelToUsers = async (req, res) => {
  try {
    const { fileId, senderId, recipientIds } = req.body;
    
    if (!fileId || !senderId || !recipientIds || !recipientIds.length) {
      return res.status(400).json({ message: 'Datos incompletos para el envío' });
    }
    
    // Verificar que el archivo existe
    const filePath = path.join(__dirname, '../storage/excel', fileId);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    // Crear registros de envío para cada destinatario
    const sharePromises = recipientIds.map(async (recipientId) => {
      return ExcelShare.create({
        fileId,
        fileName: fileId,
        senderId,
        recipientId
      });
    });
    
    await Promise.all(sharePromises);
    
    res.status(200).json({ message: 'Archivo enviado correctamente a los usuarios seleccionados' });
  } catch (error) {
    console.error('Error al enviar el archivo Excel:', error);
    res.status(500).json({ message: 'Error al enviar el archivo Excel' });
  }
};

// Obtener archivos Excel recibidos por un usuario
exports.getReceivedExcels = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario requerido' });
    }
    
    const receivedExcels = await ExcelShare.find({ recipientId: userId })
      .populate('senderId', 'name email')
      .sort({ sentAt: -1 });
    
    res.status(200).json(receivedExcels);
  } catch (error) {
    console.error('Error al obtener archivos Excel recibidos:', error);
    res.status(500).json({ message: 'Error al obtener archivos Excel recibidos' });
  }
};

// Marcar archivo Excel como leído
exports.markExcelAsRead = async (req, res) => {
  try {
    const { shareId } = req.params;
    
    if (!shareId) {
      return res.status(400).json({ message: 'ID de compartición requerido' });
    }
    
    const excelShare = await ExcelShare.findByIdAndUpdate(
      shareId,
      { isRead: true },
      { new: true }
    );
    
    if (!excelShare) {
      return res.status(404).json({ message: 'Registro de compartición no encontrado' });
    }
    
    res.status(200).json(excelShare);
  } catch (error) {
    console.error('Error al marcar archivo Excel como leído:', error);
    res.status(500).json({ message: 'Error al marcar archivo Excel como leído' });
  }
};