import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Spin, message, Checkbox, Row, Col } from 'antd';
import { authService } from '../Service/API/authService';
import { API_URL, USER_ROUTES } from '../Service/API/apiRoutes';

interface ExcelEditorProps {
  visible: boolean;
  filename: string;
  fileData: any;
  onClose: () => void;
}

interface ExcelCell {
  value: string | number | null;
  style?: any;
}

interface ExcelRow {
  [key: string]: ExcelCell;
}

interface ExcelSheet {
  id: string;
  name: string;
  rows: { [key: string]: ExcelRow };
}

const ExcelEditor: React.FC<ExcelEditorProps> = ({
  visible,
  filename,
  fileData,
  onClose
}) => {
  const [showContent, setShowContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState<ExcelSheet[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  
  // Columnas y datos para la tabla
  const [columns, setColumns] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  useEffect(() => {
    if (showContent && excelData.length === 0) {
      loadExcelContent();
    }
  }, [showContent, fileData]);
  
  useEffect(() => {
    if (excelData.length > 0 && activeSheet >= 0 && activeSheet < excelData.length) {
      generateTableData();
    }
  }, [excelData, activeSheet]);
  
  const handleViewContent = () => {
    setShowContent(true);
  };
  
  const handleCloseContent = () => {
    setShowContent(false);
  };
  
  // Función para descargar el archivo Excel
  const handleDownloadFile = async () => {
    try {
      const { downloadExcel } = await import('../Service/API/reportService');
      await downloadExcel(filename);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      message.error('Error al descargar el archivo');
    }
  };
  
  // Función para mostrar el modal de envío de Excel
  const handleSendExcel = () => {
    fetchUsers();
    setShowSendModal(true);
  };
  
  // Función para obtener usuarios con roles específicos
  const fetchUsers = async () => {
    try {
      // Obtener coordinación
      const responseInstructores = await fetch(`${API_URL}${USER_ROUTES.GET_ALL}?rol=Coordinacion`);
      
      if (!responseInstructores.ok) {
        throw new Error('Error al cargar coordinación');
      }
      
      const instructores = await responseInstructores.json();
      
      // Obtener administradores
      const responseEquipoPedagogico = await fetch(`${API_URL}${USER_ROUTES.GET_ALL}?rol=Admin`);
      
      if (!responseEquipoPedagogico.ok) {
        throw new Error('Error al cargar administradores');
      }
      
      const equipoPedagogico = await responseEquipoPedagogico.json();
      
      // Combinar los resultados
      const combinedData = [...instructores, ...equipoPedagogico];
      
      console.log('Respuesta de la API:', combinedData);
      console.log('Cantidad de usuarios recibidos:', combinedData.length);
      
      if (combinedData.length === 0) {
        message.info('No se encontraron usuarios');
      }
      
      setRecipients(combinedData);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      message.error('Error al cargar la lista de usuarios');
    }
  };
  
  // Función para enviar el Excel a los usuarios seleccionados
  const sendExcelToUsers = async () => {
    if (selectedUsers.length === 0) {
      message.warning('Seleccione al menos un usuario para enviar el archivo');
      return;
    }
    
    try {
      const { default: axios } = await import('axios');
      const token = authService.getToken();
      const currentUser = authService.getAuthenticatedUser();
      
      await axios.post('http://localhost:3001/api/excel-shares/send', {
        fileId: filename,
        senderId: currentUser?.id,
        recipientIds: selectedUsers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Archivo enviado correctamente');
      setShowSendModal(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error al enviar el archivo:', error);
      message.error('Error al enviar el archivo');
    }
  };
  
  const loadExcelContent = async () => {
    if (!fileData) return;
    
    setLoading(true);
    try {
      // Llamada real a la API para obtener el contenido del Excel
      const { getExcelContent } = await import('../Service/API/reportService');
      const response = await getExcelContent(filename);
      
      if (response && typeof response === 'object' && 'worksheets' in response) {
        // Usamos type assertion para indicar el tipo esperado
        const worksheets = (response as { worksheets: any[] }).worksheets;
        
        // Transformar los datos recibidos al formato que espera nuestro componente
        const formattedData: ExcelSheet[] = worksheets.map((sheet: any, index: number) => {
          // Convertir el formato de filas del backend al formato que usa nuestro componente
          const formattedRows: { [key: string]: ExcelRow } = {};
          
          // Procesar cada fila del worksheet
          if (sheet.rows && Array.isArray(sheet.rows)) {
            sheet.rows.forEach((row: any) => {
              const rowNumber = row.number.toString();
              formattedRows[rowNumber] = {};
              
              // Procesar cada celda de la fila
              if (row.cells && Array.isArray(row.cells)) {
                row.cells.forEach((cell: any) => {
                  // Convertir número de columna a letra (1 -> A, 2 -> B, etc.)
                  const colLetter = String.fromCharCode(64 + cell.column); // 65 es 'A' en ASCII, pero restamos 1 porque column empieza en 1
                  
                  formattedRows[rowNumber][colLetter] = {
                    value: cell.value !== undefined ? cell.value : '',
                    style: cell.style || {}
                  };
                });
              }
            });
          }
          
          return {
            id: sheet.id?.toString() || index.toString(),
            name: sheet.name || `Hoja${index + 1}`,
            rows: formattedRows
          };
        });
        
        if (formattedData.length > 0) {
          setExcelData(formattedData);
          setActiveSheet(0);
        } else {
          // Si no hay datos, mostrar datos de ejemplo
          useMockData();
        }
      } else {
        // Si la respuesta no tiene el formato esperado, mostrar datos de ejemplo
        useMockData();
      }
    } catch (error) {
      console.error('Error al cargar el contenido del Excel:', error);
      message.error('Error al cargar el contenido del Excel');
      
      // En caso de error, mostrar datos de ejemplo
      useMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Función para generar datos de ejemplo
  const useMockData = () => {
    const mockData: ExcelSheet[] = [
      {
        id: '1',
        name: 'Datos principales',
        rows: {
          '1': { 'A': { value: 'Nombre' }, 'B': { value: 'Apellido' }, 'C': { value: 'Edad' }, 'D': { value: 'Ciudad' } },
          '2': { 'A': { value: 'Juan' }, 'B': { value: 'Pérez' }, 'C': { value: 25 }, 'D': { value: 'Bogotá' } },
          '3': { 'A': { value: 'María' }, 'B': { value: 'González' }, 'C': { value: 30 }, 'D': { value: 'Medellín' } },
          '4': { 'A': { value: 'Carlos' }, 'B': { value: 'Rodríguez' }, 'C': { value: 28 }, 'D': { value: 'Cali' } },
          '5': { 'A': { value: 'Ana' }, 'B': { value: 'Martínez' }, 'C': { value: 22 }, 'D': { value: 'Barranquilla' } },
          '6': { 'A': { value: 'Pedro' }, 'B': { value: 'Sánchez' }, 'C': { value: 35 }, 'D': { value: 'Cartagena' } }
        }
      },
      {
        id: '2',
        name: 'Información adicional',
        rows: {
          '1': { 'A': { value: 'Profesión' }, 'B': { value: 'Salario' }, 'C': { value: 'Años de experiencia' } },
          '2': { 'A': { value: 'Ingeniero' }, 'B': { value: 3500000 }, 'C': { value: 3 } },
          '3': { 'A': { value: 'Médico' }, 'B': { value: 4200000 }, 'C': { value: 5 } },
          '4': { 'A': { value: 'Profesor' }, 'B': { value: 2800000 }, 'C': { value: 4 } },
          '5': { 'A': { value: 'Diseñador' }, 'B': { value: 3100000 }, 'C': { value: 2 } },
          '6': { 'A': { value: 'Abogado' }, 'B': { value: 3800000 }, 'C': { value: 7 } }
        }
      }
    ];
    
    setExcelData(mockData);
    setActiveSheet(0);
  };
  
  // Generar columnas y datos dinámicamente basados en el contenido real del Excel
  const generateTableData = () => {
    if (!excelData || excelData.length === 0 || !excelData[activeSheet]) {
      setColumns([]);
      setData([]);
      return;
    }
    
    const sheet = excelData[activeSheet];
    if (!sheet || !sheet.rows) {
      setColumns([]);
      setData([]);
      return;
    }
    
    // Determinar todas las columnas disponibles
    const allColumns = new Set<string>();
    Object.values(sheet.rows).forEach(row => {
      Object.keys(row as object).forEach(key => allColumns.add(key));
    });
    
    // Generar columnas
    const tableColumns = Array.from(allColumns).sort().map(col => ({
      title: col,
      dataIndex: col,
      key: col,
      render: (cell: ExcelCell) => cell?.value !== null ? cell?.value : '',
    }));
    
    // Generar datos
    const tableData = Object.entries(sheet.rows as object).map(([rowKey, rowData]) => {
      const rowObj: any = { key: rowKey };
      Object.entries(rowData as object).forEach(([colKey, cell]) => {
        rowObj[colKey] = cell;
      });
      return rowObj;
    });
    
    setColumns(tableColumns);
    setData(tableData);
  };
  
  return (
    <>
      <Modal
        title={`Previsualizando: ${filename}`}
        open={visible && !showContent}
        onCancel={onClose}
        width="80%"
        style={{ top: 20 }}
        footer={[
          <Button key="download" onClick={handleDownloadFile} type="primary" style={{ marginRight: 8 }}>
            Descargar
          </Button>,
          <Button key="send" onClick={handleSendExcel} type="primary" style={{ marginRight: 8 }}>
            Enviar Excel
          </Button>,
          <Button key="close" onClick={onClose}>
            Cerrar
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h3>El archivo Excel está listo para descargar</h3>
          <p>Nombre del archivo: <strong>{filename}</strong></p>
        </div>
        
        <div style={{ 
          border: '1px solid #f0f0f0', 
          padding: '20px', 
          borderRadius: '4px',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
            <div>Información</div>
            <div>Detalle</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'white' }}>
            <div>Archivo Excel disponible para descarga</div>
            <div>{filename}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
            <div>Tipo de archivo</div>
            <div>Microsoft Excel (.xlsx)</div>
          </div>
        </div>
      </Modal>
      
      {/* Modal para seleccionar usuarios destinatarios */}
      <Modal
        title="Enviar Excel a usuarios"
        open={showSendModal}
        onCancel={() => setShowSendModal(false)}
        onOk={sendExcelToUsers}
        okText="Enviar"
        cancelText="Cancelar"
        width="50%"
      >
        <div style={{ marginBottom: 16 }}>
          <h4>Seleccione los usuarios a los que desea enviar el archivo:</h4>
          <Checkbox.Group
            style={{ width: '100%' }}
            onChange={(values: string[]) => setSelectedUsers(values)}
          >
            <Row>
              {recipients.map((user: any) => (
                <Col span={12} key={user._id || user.id}>
                  <Checkbox value={user._id || user.id}>
                    {user.nombre} ({user.rol === 'Admin' ? 'Administrador' : 'Coordinación'})
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </div>
      </Modal>
      
      <Modal
        title={`Contenido de: ${filename}`}
        open={showContent}
        onCancel={handleCloseContent}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={handleCloseContent} type="primary">
            Cerrar
          </Button>
        ]}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Cargando contenido del Excel...</p>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            {excelData && excelData.length > 0 ? (
              <>
                {excelData.length > 1 && (
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ marginRight: 8 }}>Hojas:</span>
                    {excelData.map((sheet, index) => (
                      <Button 
                        key={sheet.id}
                        type={activeSheet === index ? 'primary' : 'default'}
                        onClick={() => setActiveSheet(index)}
                        style={{ marginRight: 8, marginBottom: 8 }}
                      >
                        {sheet.name}
                      </Button>
                    ))}
                  </div>
                )}
                
                <h3>Contenido de la hoja: {excelData[activeSheet]?.name}</h3>
                
                {data.length > 0 ? (
                  <Table 
                    columns={columns} 
                    dataSource={data} 
                    bordered 
                    pagination={{ pageSize: 100 }}
                    scroll={{ x: true, y: 500 }}
                    size="small"
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <p>Esta hoja no contiene datos</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '4px' }}>
                <p>No se pudo cargar el contenido del archivo Excel</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ExcelEditor;