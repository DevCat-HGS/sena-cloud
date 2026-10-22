const ExcelJS = require('exceljs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Directorio para almacenar archivos Excel
const EXCEL_STORAGE_DIR = path.join(__dirname, '../storage/excel');

// Asegurar que el directorio existe
if (!fs.existsSync(EXCEL_STORAGE_DIR)) {
  fs.mkdirSync(EXCEL_STORAGE_DIR, { recursive: true });
}

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, EXCEL_STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    // Preservar el nombre original del archivo, pero manejar duplicados
    let originalName = file.originalname.replace(/\s+/g, '_'); // Reemplazar espacios con guiones bajos
    
    // Verificar si el archivo ya existe y añadir sufijo numérico si es necesario
    let filePath = path.join(EXCEL_STORAGE_DIR, originalName);
    let counter = 1;
    
    // Si el archivo ya existe, añadir sufijo (1), (2), etc.
    while (fs.existsSync(filePath)) {
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
      const extension = path.extname(originalName);
      originalName = `${nameWithoutExt}(${counter})${extension}`;
      filePath = path.join(EXCEL_STORAGE_DIR, originalName);
      counter++;
    }
    
    cb(null, originalName);
  }
});

const fileFilter = (req, file, cb) => {
  // Solo permitir archivos Excel - Ampliamos los tipos MIME aceptados
  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/excel',
    'application/x-excel',
    'application/x-msexcel'
  ];
  
  const validExtensions = ['.xlsx', '.xls', '.XLS', '.XLSX'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (validMimeTypes.includes(file.mimetype) || validExtensions.some(ext => fileExt.toLowerCase() === ext.toLowerCase())) {
    cb(null, true);
  } else {
    console.log('Archivo rechazado:', file.originalname, 'Tipo MIME:', file.mimetype);
    cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
  }
};

// Configuración personalizada de busboy para mayor estabilidad
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
    fieldSize: 20 * 1024 * 1024, // 20MB para el tamaño del campo
    fieldNameSize: 100, // Tamaño máximo del nombre del campo
    fields: 10, // Número máximo de campos no-file
    files: 1, // Número máximo de archivos
    parts: 20 // Número máximo de partes (campos + archivos)
  },
  preservePath: false // No preservar la ruta completa
});

/**
 * Subir archivo Excel - Implementación que mantiene el nombre original
 */
exports.uploadExcel = (req, res) => {
  console.log('⭐ Iniciando subida de archivo Excel ');
  
  // Crear directorio si no existe
  if (!fs.existsSync(EXCEL_STORAGE_DIR)) {
    console.log('⭐ Creando directorio de almacenamiento');
    fs.mkdirSync(EXCEL_STORAGE_DIR, { recursive: true });
  }
  
  // Verificar si hay un archivo en la solicitud
  if (!req.files || !req.files.excel) {
    console.log('⭐ No se recibió ningún archivo');
    return res.status(400).json({
      error: 'No se ha proporcionado ningún archivo'
    });
  }
  
  try {
    const file = req.files.excel;
    console.log('⭐ Archivo recibido:', file.name);
    
    // Mantener el nombre original pero reemplazar espacios con guiones bajos
    let originalName = file.name.replace(/\s+/g, '_');
    let filePath = path.join(EXCEL_STORAGE_DIR, originalName);
    let counter = 1;
    
    // Verificar si el archivo ya existe y añadir sufijo numérico si es necesario
    while (fs.existsSync(filePath)) {
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
      const extension = path.extname(originalName);
      originalName = `${nameWithoutExt}(${counter})${extension}`;
      filePath = path.join(EXCEL_STORAGE_DIR, originalName);
      counter++;
    }
    
    // Mover el archivo al directorio de almacenamiento
    file.mv(filePath, (err) => {
      if (err) {
        console.error('⭐ Error guardando el archivo:', err);
        return res.status(500).json({
          error: 'Error al guardar el archivo'
        });
      }
      
      console.log('⭐ Archivo guardado correctamente:', originalName);
      
      // Responder con éxito
      res.status(200).json({
        message: 'Archivo subido correctamente',
        file: {
          filename: originalName,
          originalname: file.name,
          size: file.size
        }
      });
    });
  } catch (error) {
    console.error('⭐ Error procesando el archivo:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al procesar el archivo'
    });
  }
};

/**
 * Crear nuevo archivo Excel vacío
 */
exports.createExcel = async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Se requiere un nombre de archivo' });
    }
    
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SenaCloud';
    workbook.created = new Date();
    
    // Crear una hoja básica
    const worksheet = workbook.addWorksheet('Hoja1');
    
    // Agregar algunas celdas de ejemplo
    worksheet.getCell('A1').value = 'Columna 1';
    worksheet.getCell('B1').value = 'Columna 2';
    worksheet.getCell('C1').value = 'Columna 3';
    
    // Aplicar estilo a los encabezados
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Ajustar ancho de columnas
    worksheet.columns = [
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ];
    
    const filePath = path.join(EXCEL_STORAGE_DIR, `${filename}.xlsx`);
    
    // Guardar el archivo
    await workbook.xlsx.writeFile(filePath);
    
    res.json({
      message: 'Archivo Excel creado exitosamente',
      filename: `${filename}.xlsx`,
      path: filePath
    });
    
  } catch (error) {
    console.error('Error creando archivo Excel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Listar archivos Excel
 */
exports.listExcelFiles = (req, res) => {
  try {
    const files = fs.readdirSync(EXCEL_STORAGE_DIR)
      .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
      .map(file => {
        const filePath = path.join(EXCEL_STORAGE_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.modified - a.modified);
    
    res.json({ files });
  } catch (error) {
    console.error('Error listando archivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener contenido de archivo Excel
 */
exports.getExcelContent = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(EXCEL_STORAGE_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheets = [];
    
    workbook.eachSheet((worksheet, sheetId) => {
      const sheetData = {
        name: worksheet.name,
        id: sheetId,
        rows: []
      };
      
      worksheet.eachRow((row, rowNumber) => {
        const rowData = {
          number: rowNumber,
          cells: []
        };
        
        row.eachCell((cell, colNumber) => {
          rowData.cells.push({
            column: colNumber,
            value: cell.value,
            type: cell.type,
            style: {
              font: cell.font,
              fill: cell.fill,
              border: cell.border,
              alignment: cell.alignment
            }
          });
        });
        
        sheetData.rows.push(rowData);
      });
      
      worksheets.push(sheetData);
    });
    
    res.json({
      filename,
      worksheets
    });
    
  } catch (error) {
    console.error('Error leyendo archivo Excel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
/**
 * Actualizar contenido de archivo Excel
 */
exports.updateExcelContent = async (req, res) => {
  try {
    const { filename } = req.params;
    const { worksheets } = req.body;
    
    if (!worksheets || !Array.isArray(worksheets)) {
      return res.status(400).json({ error: 'Se requieren datos de hojas de trabajo válidos' });
    }
    
    const filePath = path.join(EXCEL_STORAGE_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Actualizar cada hoja de trabajo
    worksheets.forEach(sheetData => {
      let worksheet = workbook.getWorksheet(sheetData.name);
      
      if (!worksheet) {
        worksheet = workbook.addWorksheet(sheetData.name);
      }
      
      // Limpiar contenido existente
      worksheet.spliceRows(1, worksheet.rowCount);
      
      // Agregar nuevos datos
      sheetData.rows.forEach(rowData => {
        const row = worksheet.getRow(rowData.number);
        
        rowData.cells.forEach(cellData => {
          const cell = row.getCell(cellData.column);
          cell.value = cellData.value;
          
          // Aplicar estilos si existen
          if (cellData.style) {
            if (cellData.style.font) cell.font = cellData.style.font;
            if (cellData.style.fill) cell.fill = cellData.style.fill;
            if (cellData.style.border) cell.border = cellData.style.border;
            if (cellData.style.alignment) cell.alignment = cellData.style.alignment;
          }
        });
      });
    });
    
    // Guardar archivo actualizado
    await workbook.xlsx.writeFile(filePath);
    
    res.json({
      message: 'Archivo Excel actualizado exitosamente',
      filename
    });
    
  } catch (error) {
    console.error('Error actualizando archivo Excel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Descargar archivo Excel
 */
exports.downloadExcel = (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(EXCEL_STORAGE_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error descargando archivo:', err);
        res.status(500).json({ error: 'Error descargando archivo' });
      }
    });
    
  } catch (error) {
    console.error('Error en descarga:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Eliminar archivo Excel
 */
exports.deleteExcel = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      console.error('Error: Nombre de archivo no proporcionado');
      return res.status(400).json({ message: 'Nombre de archivo no proporcionado' });
    }
    
    // Decodificar el nombre del archivo en caso de que contenga caracteres especiales
    const decodedFilename = decodeURIComponent(filename);
    console.log(`Nombre de archivo a eliminar: ${decodedFilename}`);
    
    // Asegurar que el directorio de almacenamiento existe
    if (!fs.existsSync(EXCEL_STORAGE_DIR)) {
      console.log(`Creando directorio de almacenamiento: ${EXCEL_STORAGE_DIR}`);
      fs.mkdirSync(EXCEL_STORAGE_DIR, { recursive: true });
    }
    
    const filePath = path.join(EXCEL_STORAGE_DIR, decodedFilename);
    console.log(`Intentando eliminar archivo: ${filePath}`);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`Archivo no encontrado: ${filePath}`);
      
      // Listar archivos en el directorio para depuración
      const files = fs.readdirSync(EXCEL_STORAGE_DIR);
      console.log(`Archivos disponibles en el directorio: ${files.join(', ')}`);
      
      return res.status(404).json({ 
        message: 'Archivo no encontrado', 
        details: `No se encontró el archivo: ${decodedFilename}`,
        path: filePath
      });
    }
    
    // Eliminar archivo usando fs.promises para mejor manejo de errores
    await fs.promises.unlink(filePath);
    console.log(`Archivo eliminado correctamente: ${filePath}`);
    
    return res.status(200).json({ 
      message: 'Archivo eliminado correctamente',
      filename: decodedFilename
    });
  } catch (error) {
    console.error('Error al eliminar archivo Excel:', error);
    return res.status(500).json({ 
      message: 'Error al eliminar archivo', 
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Renombrar archivo Excel
 */
exports.renameExcel = (req, res) => {
  try {
    const { filename } = req.params;
    const { newName } = req.body;
    
    if (!newName) {
      return res.status(400).json({ error: 'Se requiere un nuevo nombre' });
    }
    
    const oldPath = path.join(EXCEL_STORAGE_DIR, filename);
    const newPath = path.join(EXCEL_STORAGE_DIR, `${newName}.xlsx`);
    
    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    if (fs.existsSync(newPath)) {
      return res.status(400).json({ error: 'Ya existe un archivo con ese nombre' });
    }
    
    fs.renameSync(oldPath, newPath);
    
    res.json({
      message: 'Archivo renombrado exitosamente',
      oldName: filename,
      newName: `${newName}.xlsx`
    });
    
  } catch (error) {
    console.error('Error renombrando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Guardar datos de Luckysheet
 */
exports.saveLuckysheetData = async (req, res) => {
  try {
    const { filename } = req.params;
    const { luckysheetData } = req.body;
    
    if (!luckysheetData || !luckysheetData.sheets) {
      return res.status(400).json({ error: 'Se requieren datos válidos de Luckysheet' });
    }
    
    const filePath = path.join(EXCEL_STORAGE_DIR, filename);
    
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SenaCloud';
    workbook.modified = new Date();
    
    // Convertir datos de Luckysheet a formato ExcelJS
    luckysheetData.sheets.forEach((sheetData, index) => {
      const worksheet = workbook.addWorksheet(sheetData.name || `Sheet${index + 1}`);
      
      // Procesar datos de celdas
      if (sheetData.celldata && Array.isArray(sheetData.celldata)) {
        sheetData.celldata.forEach(cellInfo => {
          if (cellInfo.r !== undefined && cellInfo.c !== undefined && cellInfo.v !== undefined) {
            const row = cellInfo.r + 1; // Luckysheet usa índices base 0
            const col = cellInfo.c + 1;
            const cell = worksheet.getCell(row, col);
            
            // Establecer valor
            if (cellInfo.v.v !== undefined) {
              cell.value = cellInfo.v.v;
            }
            
            // Aplicar formato si existe
            if (cellInfo.v.s) {
              const style = cellInfo.v.s;
              
              // Fuente
              if (style.ff || style.fs || style.fc || style.bl || style.it) {
                cell.font = {
                  name: style.ff || 'Arial',
                  size: style.fs || 10,
                  color: { argb: style.fc || 'FF000000' },
                  bold: style.bl === 1,
                  italic: style.it === 1
                };
              }
              
              // Fondo
              if (style.bg) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: style.bg }
                };
              }
              
              // Alineación
              if (style.vt || style.ht) {
                cell.alignment = {
                  vertical: style.vt === 1 ? 'middle' : style.vt === 2 ? 'bottom' : 'top',
                  horizontal: style.ht === 1 ? 'center' : style.ht === 2 ? 'right' : 'left'
                };
              }
            }
          }
        });
      }
      
      // Configurar dimensiones de columnas
      if (sheetData.config && sheetData.config.columnlen) {
        Object.keys(sheetData.config.columnlen).forEach(colIndex => {
          const width = sheetData.config.columnlen[colIndex] / 7; // Convertir píxeles a unidades de Excel
          worksheet.getColumn(parseInt(colIndex) + 1).width = width;
        });
      }
      
      // Configurar altura de filas
      if (sheetData.config && sheetData.config.rowlen) {
        Object.keys(sheetData.config.rowlen).forEach(rowIndex => {
          const height = sheetData.config.rowlen[rowIndex] * 0.75; // Convertir píxeles a puntos
          worksheet.getRow(parseInt(rowIndex) + 1).height = height;
        });
      }
    });
    
    // Guardar el archivo
    await workbook.xlsx.writeFile(filePath);
    
    res.json({
      message: 'Datos de Luckysheet guardados exitosamente',
      filename
    });
    
  } catch (error) {
    console.error('Error guardando datos de Luckysheet:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener archivo Excel como buffer para Luckysheet
 */
exports.getExcelFileBuffer = (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(EXCEL_STORAGE_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Leer archivo como buffer
    const fileBuffer = fs.readFileSync(filePath);
    
    // Establecer headers apropiados
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Enviar buffer
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('Error obteniendo buffer del archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};