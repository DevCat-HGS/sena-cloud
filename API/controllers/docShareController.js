const DocShare = require('../models/DocShare');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

// Directorio de almacenamiento
const uploadDir = path.join(__dirname, '../storage/uploads');

// Asegurar que el directorio existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Función para verificar si un archivo existe y generar un nombre único
const getUniqueFileName = (originalName) => {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  let newName = originalName;
  let counter = 1;
  
  while (fs.existsSync(path.join(uploadDir, newName))) {
    newName = `${nameWithoutExt}(${counter})${ext}`;
    counter++;
  }
  
  return newName;
};

// Enviar archivo Word/PDF a usuarios
exports.sendDocToUsers = async (req, res) => {
  try {
    // Depurar la solicitud recibida
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    
    // Verificar si hay un archivo en la solicitud
    if (!req.files) {
      return res.status(400).json({ message: 'No se ha recibido ningún archivo en la solicitud' });
    }
    
    // Buscar el archivo en cualquier campo de la solicitud
    let document;
    if (req.files.document) {
      document = req.files.document;
    } else if (req.files.file) {
      document = req.files.file;
    } else {
      // Intentar encontrar el archivo en cualquier propiedad de req.files
      const fileKeys = Object.keys(req.files);
      if (fileKeys.length > 0) {
        document = req.files[fileKeys[0]];
      } else {
        return res.status(400).json({ message: 'No se ha encontrado ningún archivo en la solicitud' });
      }
    }
    const { recipientIds } = req.body;

    if (!recipientIds) {
      return res.status(400).json({ message: 'No se han especificado destinatarios' });
    }

    // Verificar que el archivo sea Word o PDF
    const fileExtension = path.extname(document.name).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(fileExtension)) {
      return res.status(400).json({ message: 'Solo se permiten archivos Word o PDF' });
    }

    // Verificar si los destinatarios son instructores
    if (Array.isArray(recipientIds)) {
      const instructors = await User.find({ _id: { $in: recipientIds }, role: 'Instructor' });
      if (instructors.length !== recipientIds.length) {
        return res.status(400).json({ message: 'Todos los destinatarios deben ser instructores' });
      }
    } else {
      const instructor = await User.findOne({ _id: recipientIds, role: 'Instructor' });
      if (!instructor) {
        return res.status(400).json({ message: 'El destinatario debe ser un instructor' });
      }
    }

    // Verificar que el usuario esté aprobado
    const sender = await User.findById(req.user.id);
    if (!sender || sender.status !== 'approved') {
      return res.status(403).json({ message: 'Solo los usuarios aprobados pueden enviar archivos' });
    }

    // Generar ID único para el archivo
    const fileId = uuidv4();
    const fileName = `${fileId}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Guardar el archivo
    await document.mv(filePath);

    // Determinar el tipo de archivo
    let fileType;
    if (fileExtension === '.pdf') {
      fileType = 'pdf';
    } else if (['.doc', '.docx'].includes(fileExtension)) {
      fileType = 'word';
    }

    // Crear registros de compartición para cada destinatario
    const recipients = Array.isArray(recipientIds) ? recipientIds : [recipientIds];
    const shares = [];

    for (const recipientId of recipients) {
      const share = new DocShare({
        fileId,
        fileName: document.name,
        fileType,
        filePath: fileName,
        senderId: req.user.id,
        recipientId
      });

      await share.save();
      shares.push(share);
    }

    res.status(201).json({
      message: 'Archivo enviado correctamente',
      shares
    });
  } catch (error) {
    console.error('Error al enviar archivo:', error);
    res.status(500).json({ message: 'Error al enviar el archivo', error: error.message });
  }
};

// Subir documento (para cualquier usuario autenticado)
exports.uploadDoc = async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(403).json({ message: 'No tienes permisos para subir documentos' });
    }

    // Depurar la solicitud recibida
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    
    // Verificar si hay un archivo en la solicitud
    if (!req.files) {
      return res.status(400).json({ message: 'No se ha recibido ningún archivo en la solicitud' });
    }
    
    // Buscar el archivo en cualquier campo de la solicitud
    let document;
    if (req.files.document) {
      document = req.files.document;
    } else if (req.files.file) {
      document = req.files.file;
    } else {
      // Intentar encontrar el archivo en cualquier propiedad de req.files
      const fileKeys = Object.keys(req.files);
      if (fileKeys.length > 0) {
        document = req.files[fileKeys[0]];
      } else {
        return res.status(400).json({ message: 'No se ha encontrado ningún archivo en la solicitud' });
      }
    }

    // Verificar que el archivo sea Word o PDF
    const fileExtension = path.extname(document.name).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(fileExtension)) {
      return res.status(400).json({ message: 'Solo se permiten archivos Word o PDF' });
    }

    // Mantener el nombre original y verificar duplicados
    const originalName = document.name;
    const uniqueFileName = getUniqueFileName(originalName);
    const filePath = path.join(uploadDir, uniqueFileName);

    // Guardar el archivo
    await document.mv(filePath);

    // Determinar el tipo de archivo
    let fileType;
    if (fileExtension === '.pdf') {
      fileType = 'pdf';
    } else if (['.doc', '.docx'].includes(fileExtension)) {
      fileType = 'word';
    }

    // Crear registro de documento subido
    const docShare = new DocShare({
      fileId: path.basename(uniqueFileName, fileExtension),
      fileName: uniqueFileName,
      fileType,
      filePath: uniqueFileName,
      senderId: req.user.id,
      recipientId: req.user.id, // El destinatario es el mismo usuario que sube
      isUploaded: true // Marcar como documento subido, no compartido
    });

    await docShare.save();

    res.status(201).json({
      message: 'Documento subido correctamente',
      document: docShare
    });
  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ message: 'Error al subir el documento', error: error.message });
  }
};

// Listar todos los archivos en la carpeta uploads
exports.listAllFiles = async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(403).json({ message: 'No tienes permisos para ver los archivos' });
    }

    const files = await readdir(uploadDir);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(uploadDir, file);
        const stats = await stat(filePath);
        const fileExtension = path.extname(file).toLowerCase();
        
        let fileType;
        if (fileExtension === '.pdf') {
          fileType = 'pdf';
        } else if (['.doc', '.docx'].includes(fileExtension)) {
          fileType = 'word';
        } else {
          fileType = 'other';
        }

        return {
          name: file,
          path: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          type: fileType
        };
      })
    );

    res.status(200).json({
      message: 'Archivos listados correctamente',
      files: fileDetails
    });
  } catch (error) {
    console.error('Error al listar archivos:', error);
    res.status(500).json({ message: 'Error al listar los archivos', error: error.message });
  }
};

// Obtener todos los documentos compartidos
exports.getAllSharedDocs = async (req, res) => {
  try {
    const shares = await DocShare.find()
      .populate('senderId', 'name email role')
      .populate('recipientId', 'name email role')
      .sort({ sentAt: -1 });
    
    res.status(200).json(shares);
  } catch (error) {
    console.error('Error al obtener todos los documentos compartidos:', error);
    res.status(500).json({ message: 'Error al obtener los documentos compartidos', error: error.message });
  }
};

// Editar nombre de archivo
exports.renameFile = async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(403).json({ message: 'No tienes permisos para editar archivos' });
    }

    const { oldName, newName } = req.body;
    
    if (!oldName || !newName) {
      return res.status(400).json({ message: 'Se requieren los nombres antiguo y nuevo del archivo' });
    }

    const oldPath = path.join(uploadDir, oldName);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({ message: 'El archivo no existe' });
    }

    // Generar un nombre único para evitar duplicados
    const uniqueNewName = getUniqueFileName(newName);
    const newPath = path.join(uploadDir, uniqueNewName);

    // Renombrar el archivo
    fs.renameSync(oldPath, newPath);

    // Actualizar el registro en la base de datos si existe
    const docShare = await DocShare.findOne({ filePath: oldName });
    if (docShare) {
      docShare.fileName = uniqueNewName;
      docShare.filePath = uniqueNewName;
      await docShare.save();
    }

    res.status(200).json({
      message: 'Archivo renombrado correctamente',
      oldName,
      newName: uniqueNewName
    });
  } catch (error) {
    console.error('Error al renombrar archivo:', error);
    res.status(500).json({ message: 'Error al renombrar el archivo', error: error.message });
  }
};

// Eliminar archivo
exports.deleteFile = async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar archivos' });
    }

    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({ message: 'Se requiere el nombre del archivo' });
    }

    const filePath = path.join(uploadDir, fileName);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'El archivo no existe' });
    }

    // Eliminar el archivo
    fs.unlinkSync(filePath);

    // Eliminar el registro en la base de datos si existe
    await DocShare.deleteMany({ filePath: fileName });

    res.status(200).json({
      message: 'Archivo eliminado correctamente',
      fileName
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ message: 'Error al eliminar el archivo', error: error.message });
  }
};

// Obtener archivos Word/PDF recibidos por un usuario
exports.getReceivedDocs = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario requerido' });
    }
    
    const shares = await DocShare.find({ recipientId: userId })
      .populate('senderId', 'name email')
      .populate('recipientId', 'name email role')
      .sort({ sentAt: -1 });
    
    res.status(200).json(shares);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ message: 'Error al obtener los documentos', error: error.message });
  }
};

// Obtener archivos Word/PDF enviados por un usuario
exports.getSentDocs = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar que el usuario solicitante sea el mismo que el usuario de los documentos
    if (req.user.id !== userId && req.user.role !== 'EquipoPedagogico') {
      return res.status(403).json({ message: 'No tiene permiso para ver estos documentos' });
    }

    const shares = await DocShare.find({ senderId: userId })
      .populate('recipientId', 'name email')
      .sort({ sentAt: -1 });

    res.json(shares);
  } catch (error) {
    console.error('Error al obtener documentos enviados:', error);
    res.status(500).json({ message: 'Error al obtener los documentos enviados', error: error.message });
  }
};

// Obtener archivos Word/PDF enviados por un usuario
exports.getSentDocs = async (req, res) => {
  try {
    const { userId } = req.params;

    const shares = await DocShare.find({ senderId: userId })
      .populate('recipientId', 'nombre apellido correoInstitucional')
      .sort({ sentAt: -1 });

    res.json(shares);
  } catch (error) {
    console.error('Error al obtener documentos enviados:', error);
    res.status(500).json({ message: 'Error al obtener los documentos enviados', error: error.message });
  }
};

// Marcar archivo Word/PDF como leído
exports.markDocAsRead = async (req, res) => {
  try {
    const { shareId } = req.params;
    
    if (!shareId) {
      return res.status(400).json({ message: 'ID de compartición requerido' });
    }
    
    const docShare = await DocShare.findByIdAndUpdate(
      shareId,
      { isRead: true },
      { new: true }
    );
    
    if (!docShare) {
      return res.status(404).json({ message: 'Registro de compartición no encontrado' });
    }
    
    res.status(200).json(docShare);
  } catch (error) {
    console.error('Error al marcar documento como leído:', error);
    res.status(500).json({ message: 'Error al marcar el documento como leído', error: error.message });
  }
};

// Descargar archivo Word/PDF
exports.downloadDoc = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Buscar el documento compartido
    const docShare = await DocShare.findOne({ fileId });
    if (!docShare) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    const filePath = path.join(uploadDir, docShare.filePath);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }
    
    // Enviar el archivo
    res.download(filePath, docShare.fileName);
  } catch (error) {
    console.error('Error al descargar el documento:', error);
    res.status(500).json({ message: 'Error al descargar el documento' });
  }
};

// Nota: Se eliminó la implementación duplicada de uploadDoc que sobrescribía esta función.

// Obtener documentos subidos por un usuario
exports.getUserDocs = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Buscar documentos enviados por el usuario (sin destinatario específico)
    const docs = await DocShare.find({ 
      senderId: userId,
      recipientId: userId // Cuando el remitente y destinatario son el mismo, es un documento subido sin enviar
    });
    
    if (!docs || docs.length === 0) {
      return res.json({ documents: [] });
    }
    
    res.json({ 
      documents: docs.map(doc => ({
        id: doc._id,
        fileId: doc.fileId,
        fileName: doc.fileName,
        fileType: doc.fileType,
        originalName: doc.fileName,
        sentAt: doc.sentAt
      }))
    });
  } catch (error) {
    console.error('Error al obtener documentos del usuario:', error);
    res.status(500).json({ message: 'Error al obtener los documentos del usuario', error: error.message });
  }
};