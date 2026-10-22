import { httpService } from './httpService';
import { authService } from './authService';
import { API_URL } from './apiRoutes';

// Subir archivo Excel
export const uploadExcel = async (file: File) => {
  console.log('📤 Iniciando subida de archivo Excel', {
    nombre: file.name,
    tipo: file.type,
    tamaño: `${(file.size / 1024 / 1024).toFixed(2)} MB`
  });
  
  const formData = new FormData();
  formData.append('excel', file);
  
  // Para FormData, necesitamos usar fetch directamente pero con el token
  const token = authService.getToken();
  console.log('📤 Token obtenido, preparando fetch');
  
  try {
    console.log('📤 Enviando solicitud al servidor');
    const response = await fetch(`${API_URL}/api/reports/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData,
      credentials: 'include'
    });
    
    console.log('📤 Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
    });
    
    if (!response.ok) {
      console.error('📤 Error en la respuesta del servidor:', response.status, response.statusText);
      // Intentar obtener el mensaje de error del servidor
      const errorText = await response.text();
      console.error('📤 Texto de error completo:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.log('📤 Error parseado:', errorData);
      } catch (e) {
        console.error('📤 No se pudo parsear la respuesta como JSON:', e);
      }
      
      if (errorData && errorData.error) {
        throw new Error(errorData.error);
      }
      throw new Error(`Error al subir el archivo (${response.status})`);
    }
    
    console.log('📤 Subida exitosa, procesando respuesta');
    const data = await response.json();
    console.log('📤 Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('📤 Error en la subida del archivo:', error);
    throw error;
  }
};

// Enviar archivo Excel por correo electrónico
export const sendExcelByEmail = async (filename: string, email: string, subject?: string, message?: string) => {
  try {
    return await httpService.post<any>(`${API_URL}/api/reports/send-email`, { 
      filename,
      email,
      subject: subject || `Reporte Excel: ${filename}`,
      message: message || `Se adjunta el reporte Excel solicitado: ${filename}`
    });
  } catch (error) {
    console.error('Error al enviar archivo Excel por correo:', error);
    throw new Error('No se pudo enviar el archivo por correo. Por favor, intente de nuevo.');
  }
};

// Crear nuevo archivo Excel
export const createExcel = async (filename: string) => {
  try {
    return await httpService.post<any>(`${API_URL}/api/reports/create`, { filename });
  } catch (error) {
    console.error('Error al crear archivo Excel:', error);
    throw new Error('No se pudo crear el archivo Excel. Por favor, intente de nuevo.');
  }
};

// Listar archivos Excel
export const listExcelFiles = async () => {
  try {
    return await httpService.get<{files: any[]}>(`${API_URL}/api/reports/list`);
  } catch (error) {
    console.error('Error al listar archivos Excel:', error);
    // Devolver un objeto vacío en caso de error para evitar que la interfaz se rompa
    return { files: [] };
  }
};

// Obtener contenido de archivo Excel
export const getExcelContent = async (filename: string) => {
  try {
    return await httpService.get<any>(`${API_URL}/api/reports/content/${filename}`);
  } catch (error) {
    console.error('Error al obtener contenido del archivo Excel:', error);
    throw new Error('No se pudo obtener el contenido del archivo. Por favor, intente de nuevo.');
  }
};

// Actualizar contenido de archivo Excel
export const updateExcelContent = async (filename: string, worksheets: any[]) => {
  try {
    return await httpService.put<any>(`${API_URL}/api/reports/update/${filename}`, { worksheets });
  } catch (error) {
    console.error('Error al actualizar contenido del archivo Excel:', error);
    throw new Error('No se pudo actualizar el archivo. Por favor, intente de nuevo.');
  }
};

// Descargar archivo Excel
export const downloadExcel = async (filename: string) => {
  const token = authService.getToken();
  const response = await fetch(`${API_URL}/api/reports/download/${filename}`, {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Error al descargar el archivo');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Eliminar archivo Excel
export const deleteExcel = async (filename: string) => {
  try {
    // Codificar el nombre del archivo para manejar caracteres especiales
    const encodedFilename = encodeURIComponent(filename);
    console.log(`[DELETE_SERVICE] Iniciando eliminación de archivo: ${filename}`);
    console.log(`[DELETE_SERVICE] Nombre codificado: ${encodedFilename}`);
    console.log(`[DELETE_SERVICE] URL completa: ${API_URL}/api/reports/delete/${encodedFilename}`);
    
    // Verificar token de autenticación
    const token = authService.getToken();
    console.log(`[DELETE_SERVICE] Token disponible: ${token ? 'Sí' : 'No'}`);
    
    // Realizar la solicitud DELETE con logs detallados
    console.log(`[DELETE_SERVICE] Enviando solicitud DELETE...`);
    return await httpService.delete<{success: boolean; message?: string}>(`${API_URL}/api/reports/delete/${encodedFilename}`);
  } catch (error: any) {
    console.error('[DELETE_SERVICE] ❌ Error al eliminar archivo Excel:', error);
    
    // Información detallada del error
    console.log('[DELETE_SERVICE] Tipo de error:', typeof error);
    
    // Extraer información detallada del error
    if (error && typeof error === 'object') {
      // Verificar si el error tiene una propiedad response
      const errorResponse = error.response as any;
      if (errorResponse) {
        console.log('[DELETE_SERVICE] Status del error:', errorResponse.status);
        console.log('[DELETE_SERVICE] Headers de respuesta:', errorResponse.headers);
        
        if (errorResponse.data) {
          console.log('[DELETE_SERVICE] Datos del error:', errorResponse.data);
          
          // Si hay un mensaje específico en la respuesta, usarlo
          if (errorResponse.data.message) {
            throw new Error(`Error del servidor: ${errorResponse.data.message}`);
          }
        }
      }
      
      if ('message' in error) {
        console.log('[DELETE_SERVICE] Mensaje de error:', error.message);
      }
      
      if ('config' in error) {
        const config = error.config as any;
        console.log('[DELETE_SERVICE] URL de la solicitud:', config.url);
        console.log('[DELETE_SERVICE] Método de la solicitud:', config.method);
      }
    }
    
    // Lanzar error con mensaje más descriptivo
    const errorResponse = (error as any).response;
    throw new Error(
      errorResponse?.data?.message || 
      (error as Error).message || 
      'No se pudo eliminar el archivo. Por favor, intente de nuevo.'
    );
  }
};

// Renombrar archivo Excel
export const renameExcel = async (filename: string, newName: string) => {
  try {
    return await httpService.put<any>(`${API_URL}/api/reports/rename/${filename}`, { newName });
  } catch (error) {
    console.error('Error al renombrar archivo Excel:', error);
    throw new Error('No se pudo renombrar el archivo. Por favor, intente de nuevo.');
  }
};

// Guardar datos de Luckysheet
export const saveLuckysheetData = async (filename: string, luckysheetData: any) => {
  try {
    return await httpService.put<any>(`${API_URL}/api/reports/save-luckysheet/${filename}`, { luckysheetData });
  } catch (error) {
    console.error('Error al guardar datos de Luckysheet:', error);
    throw new Error('No se pudieron guardar los datos. Por favor, intente de nuevo.');
  }
};

// Obtener archivo Excel como ArrayBuffer para Luckysheet
export const getExcelFileBuffer = async (filename: string): Promise<ArrayBuffer> => {
  const token = authService.getToken();
  
  console.log('Fetching Excel file buffer for:', filename);
  
  const response = await fetch(`${API_URL}/api/reports/file-buffer/${filename}`, {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server response error:', response.status, errorText);
    throw new Error(`Error al obtener el archivo: ${response.status} ${response.statusText}`);
  }
  
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  console.log('Response content-type:', response.headers.get('content-type'));
  
  const arrayBuffer = await response.arrayBuffer();
  console.log('Received ArrayBuffer:', arrayBuffer, 'length:', arrayBuffer.byteLength);
  
  return arrayBuffer;
};