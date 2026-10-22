import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Upload, Plus, Edit, Download, Trash2, FolderOpen, RefreshCw, Eye, X, Save } from "lucide-react";
import { uploadExcel, createExcel, listExcelFiles, deleteExcel, downloadExcel, renameExcel, getExcelFileBuffer, saveLuckysheetData } from '../../Service/API/reportService';
import ExcelEditor from '../../components/ExcelEditor';
import { toast } from 'react-toastify';

interface ExcelFile {
  filename: string;
  originalName: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

const ReportsPage: React.FC = () => {
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [fileToRename, setFileToRename] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  // Estados para el editor de Excel con Luckysheet
  const [showExcelEditor, setShowExcelEditor] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentFileData, setCurrentFileData] = useState<ArrayBuffer | undefined>(undefined);

  // Cargar lista de archivos Excel
  const loadExcelFiles = async () => {
    try {
      setIsLoading(true);
      const response = await listExcelFiles();
      setExcelFiles((response as { files?: ExcelFile[] }).files || []);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExcelFiles();
  }, []);

  // Subir archivo Excel
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Verificar si es un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }
    
    // Mostrar confirmación
    setFileToUpload(file);
    setShowConfirmModal(true);
    
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  };
  
  // Confirmar y procesar la carga del archivo
  const confirmAndUploadFile = async () => {
    if (!fileToUpload) return;
    
    try {
      setIsLoading(true);
      await uploadExcel(fileToUpload);
      toast.success('Archivo subido correctamente');
      await loadExcelFiles();
      setShowConfirmModal(false);
      setFileToUpload(null);
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      // Mostrar mensaje de error más específico
      const errorMessage = error?.message || 'Error al subir el archivo';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancelar la carga del archivo
  const cancelFileUpload = () => {
    setShowConfirmModal(false);
    setFileToUpload(null);
  };
  
  // Manejar eventos de arrastrar y soltar
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    // Verificar si es un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }
    
    // Mostrar confirmación
    setFileToUpload(file);
    setShowConfirmModal(true);
  }, []);

  // Crear nuevo archivo Excel
  const handleCreateExcel = async () => {
    if (!newFileName.trim()) return;

    try {
      setIsLoading(true);
      await createExcel(newFileName);
      await loadExcelFiles();
      setShowCreateModal(false);
      setNewFileName('');
    } catch (error) {
      console.error('Error al crear archivo:', error);
      alert('Error al crear el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar archivo Excel
  const handleDeleteFile = async (filename: string) => {
    // Eliminamos la confirmación duplicada aquí, ya que se hace en el botón
    
    try {
      // Logs más visibles con emojis y formato distintivo
      console.log(`%c[DELETE] 🚀🚀🚀 INICIANDO ELIMINACIÓN: ${filename}`, 'background: red; color: white; font-size: 14px; padding: 5px;');
      setIsLoading(true);
      
      // // Crear un elemento visual en la página para mostrar el progreso
      // const debugDiv = document.createElement('div');
      // debugDiv.id = 'debug-delete-panel';
      // debugDiv.style.position = 'fixed';
      // debugDiv.style.top = '10px';
      // debugDiv.style.right = '10px';
      // debugDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
      // debugDiv.style.color = 'white';
      // debugDiv.style.padding = '20px';
      // debugDiv.style.zIndex = '9999';
      // debugDiv.style.borderRadius = '5px';
      // debugDiv.style.maxWidth = '400px';
      // debugDiv.innerHTML = `<h3>Depuración de Eliminación</h3>
      //                      <p>Archivo: ${filename}</p>
      //                      <p>Timestamp: ${new Date().toISOString()}</p>
      //                      <div id="debug-log"></div>`;
      // document.body.appendChild(debugDiv);
      
      const addLog = (message: string) => {
        console.log(message);
        const logDiv = document.getElementById('debug-log');
        if (logDiv) {
          const p = document.createElement('p');
          p.innerHTML = message;
          logDiv.appendChild(p);
        }
      };
      
      addLog(`⏳ Llamando a deleteExcel con filename: <strong>${filename}</strong>`);
      
      // Intentamos la eliminación
      const response = await deleteExcel(filename);
      
      addLog(`✅ Respuesta del servidor: ${JSON.stringify(response)}`);
      console.log(`%c[DELETE] ✅ ÉXITO: Archivo eliminado`, 'background: green; color: white; font-size: 14px; padding: 5px;', response);
      
      addLog(`🔄 Recargando lista de archivos...`);
      await loadExcelFiles();
      toast.success(`Archivo ${filename} eliminado correctamente`);
      
      // Agregar botón para cerrar el panel
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Cerrar panel';
      closeButton.style.padding = '5px 10px';
      closeButton.style.marginTop = '10px';
      closeButton.style.backgroundColor = '#4CAF50';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '3px';
      closeButton.style.cursor = 'pointer';
      closeButton.onclick = () => {
        const panel = document.getElementById('debug-delete-panel');
        if (panel) document.body.removeChild(panel);
      };
      //debugDiv.appendChild(closeButton);
    } catch (error) {
      console.error('%c[DELETE] ❌ ERROR EN ELIMINACIÓN:', 'background: red; color: white; font-size: 14px; padding: 5px;', error);
      
      // Mostrar información detallada del error en la consola y en la página
      const errorInfo = document.createElement('div');
      errorInfo.style.backgroundColor = '#ffcccc';
      errorInfo.style.color = 'black';
      errorInfo.style.padding = '10px';
      errorInfo.style.marginTop = '10px';
      errorInfo.style.borderRadius = '5px';
      errorInfo.innerHTML = `<h4>Error al eliminar</h4>`;
      
      // Extraer más información del error si está disponible
      if (error && typeof error === 'object') {
        if ('response' in error) {
          console.log('[DELETE] Error response:', (error as any).response);
          const status = (error as any).response?.status || 'N/A';
          errorInfo.innerHTML += `<p>Status: ${status}</p>`;
          
          if ((error as any).response?.data) {
            console.log('[DELETE] Error data:', (error as any).response.data);
            errorInfo.innerHTML += `<p>Datos: ${JSON.stringify((error as any).response.data)}</p>`;
          }
        }
        
        if ('message' in error) {
          console.log('[DELETE] Error message:', (error as any).message);
          errorInfo.innerHTML += `<p>Mensaje: ${(error as any).message}</p>`;
        }
        
        if ('stack' in error) {
          console.log('[DELETE] Error stack:', (error as any).stack);
        }
      }
      
      const debugDiv = document.getElementById('debug-delete-panel');
      if (debugDiv) debugDiv.appendChild(errorInfo);
      
      toast.error(`Error al eliminar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      console.log(`%c[DELETE] 🏁 PROCESO FINALIZADO: ${filename}`, 'background: blue; color: white; font-size: 14px; padding: 5px;');
      setIsLoading(false);
    }
  };

  // Descargar archivo Excel
  const handleDownloadFile = async (filename: string) => {
    try {
      await downloadExcel(filename);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      alert('Error al descargar el archivo');
    }
  };

  // Renombrar archivo Excel
  const handleRenameFile = async () => {
    if (!fileToRename || !newFileName.trim()) return;

    try {
      setIsLoading(true);
      await renameExcel(fileToRename, newFileName);
      await loadExcelFiles();
      setShowRenameModal(false);
      setFileToRename(null);
      setNewFileName('');
    } catch (error) {
      console.error('Error al renombrar archivo:', error);
      alert('Error al renombrar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir editor de Excel con Luckysheet
  const handleOpenExcelEditor = async (filename: string) => {
    try {
      setCurrentFileName(filename);
      
      // Obtener datos del archivo como ArrayBuffer para Luckysheet
      const fileBuffer = await getExcelFileBuffer(filename);
      setCurrentFileData(fileBuffer);
      
      setShowExcelEditor(true);
    } catch (error) {
      console.error('Error al cargar archivo para editor:', error);
      alert('Error al cargar el archivo');
    }
  };

  // Guardar datos de Luckysheet
  const handleSaveLuckysheetData = async (luckysheetData: any) => {
    try {
      await saveLuckysheetData(currentFileName, luckysheetData);
      await loadExcelFiles(); // Recargar lista de archivos
    } catch (error) {
      console.error('Error al guardar datos de Luckysheet:', error);
      throw error; // Re-throw para que el componente ExcelEditor pueda manejarlo
    }
  };

  // Cerrar editor de Excel
  const handleCloseExcelEditor = () => {
    setShowExcelEditor(false);
    setCurrentFileName('');
    setCurrentFileData(undefined);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gestión de Archivos Excel</h1>
      
      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirmar subida de archivo</h3>
            <p className="mb-6">
              ¿Estás seguro de que deseas subir el archivo <span className="font-semibold">{fileToUpload?.name}</span>?
              {fileToUpload && <span className="block text-sm text-gray-500 mt-1">Tamaño: {formatFileSize(fileToUpload.size)}</span>}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelFileUpload}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAndUploadFile}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Área de arrastrar y soltar */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all ${
          isDragging 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : 'border-gray-300 hover:border-green-400 dark:border-slate-700 dark:hover:border-green-700'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <Upload size={48} className={`mb-4 ${isDragging ? 'text-green-500' : 'text-gray-400'}`} />
          <h3 className="text-xl font-semibold mb-2">Subir Reporte Excel</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Arrastra y suelta tu archivo Excel aquí o
          </p>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer">
            <Upload size={18} />
            <span>Seleccionar archivo</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          <p className="text-sm text-gray-500 mt-4">
            Formatos soportados: .xlsx, .xls (máximo 10 MB)
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-slate-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Administrador de Excel</h2>
            <p className="text-gray-600 dark:text-gray-400">Crea, sube y gestiona tus archivos Excel</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <button 
              onClick={loadExcelFiles}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Crear Excel</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer">
            <Upload size={18} />
            <span>Subir Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>

        {/* Lista de archivos */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading && excelFiles.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p>Cargando archivos...</p>
            </div>
          ) : excelFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay archivos Excel. Crea o sube uno para comenzar.</p>
            </div>
          ) : (
            excelFiles.map((file) => (
              <div 
                key={file.filename}
                className={`border rounded-xl p-4 transition-all ${selectedFile === file.filename ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 hover:border-green-300 dark:border-slate-700 dark:hover:border-green-700'}`}
                onClick={() => setSelectedFile(file.filename)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg">
                      <FileSpreadsheet className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg">{file.originalName || file.filename}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Tamaño: {formatFileSize(file.size)}</p>
                        <p>Creado: {formatDate(file.createdAt)}</p>
                        {file.modifiedAt && <p>Modificado: {formatDate(file.modifiedAt)}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenExcelEditor(file.filename);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      title="Editar con Excel completo"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(file.filename);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      title="Descargar"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToRename(file.filename);
                        setNewFileName(file.originalName || file.filename.replace('.xlsx', ''));
                        setShowRenameModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                      title="Renombrar"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        console.log('🔴 BOTÓN ELIMINAR: Click detectado');
                        console.log('🔴 BOTÓN ELIMINAR: Nombre del archivo a eliminar:', file.filename);
                        alert('Botón eliminar clickeado para: ' + file.filename);
                        e.stopPropagation();
                        console.log('🔴 BOTÓN ELIMINAR: Antes de llamar a handleDeleteFile');
                        handleDeleteFile(file.filename);
                        console.log('🔴 BOTÓN ELIMINAR: Después de llamar a handleDeleteFile');
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para crear archivo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Crear nuevo archivo Excel</h3>
            <input
              type="text"
              placeholder="Nombre del archivo"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full p-2 border rounded mb-4 dark:bg-slate-700 dark:border-slate-600"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateExcel()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewFileName('');
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateExcel}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                disabled={!newFileName.trim() || isLoading}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para renombrar archivo */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Renombrar archivo</h3>
            <input
              type="text"
              placeholder="Nuevo nombre"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full p-2 border rounded mb-4 dark:bg-slate-700 dark:border-slate-600"
              onKeyPress={(e) => e.key === 'Enter' && handleRenameFile()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setFileToRename(null);
                  setNewFileName('');
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleRenameFile}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                disabled={!newFileName.trim() || isLoading}
              >
                Renombrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Editor de Excel */}
      {showExcelEditor && (
        <ExcelEditor
          visible={showExcelEditor}
          filename={currentFileName}
          fileData={currentFileData || null}
          onClose={handleCloseExcelEditor}
        />
      )}
    </div>
  );
};

export default ReportsPage;