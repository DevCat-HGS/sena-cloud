import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Column {
  header: string;
  key: string;
  width: number;
}

interface RowStyle {
  row: number;
  font?: {
    bold?: boolean;
    color?: { argb: string };
  };
  fill?: {
    type: string;
    pattern: string;
    fgColor: { argb: string };
  };
}

interface CellStyle {
  cell: string;
  font?: {
    bold?: boolean;
    color?: { argb: string };
  };
  fill?: {
    type: string;
    pattern: string;
    fgColor: { argb: string };
  };
}

interface ReportConfig {
  columns: Column[];
  rowStyles: RowStyle[];
  cellStyles: CellStyle[];
  merges: string[];
}

interface Template {
  name: string;
  path: string;
}

const ReportDesigner: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [config, setConfig] = useState<ReportConfig>({
    columns: [],
    rowStyles: [],
    cellStyles: [],
    merges: []
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('Reporte Excel - SenaCloud');
  const [message, setMessage] = useState<string>('Adjunto encontrará el reporte solicitado.');
  const [loading, setLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Cargar plantillas disponibles
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/reports/templates');
        setTemplates(response.data.templates);
      } catch (error) {
        console.error('Error al cargar plantillas:', error);
        toast.error('Error al cargar plantillas');
      }
    };

    fetchTemplates();
  }, []);

  // Cargar datos de ejemplo para previsualización
  useEffect(() => {
    // Datos de ejemplo para la previsualización
    const sampleData = [
      { id: 1, nombre: 'Juan Pérez', correo: 'juan@example.com', rol: 'Instructor' },
      { id: 2, nombre: 'María López', correo: 'maria@example.com', rol: 'Aprendiz' },
      { id: 3, nombre: 'Carlos Gómez', correo: 'carlos@example.com', rol: 'Coordinador' }
    ];
    setPreviewData(sampleData);

    // Configurar columnas basadas en los datos de ejemplo
    const sampleColumns = Object.keys(sampleData[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      key,
      width: 20
    }));
    setConfig(prev => ({ ...prev, columns: sampleColumns }));
  }, []);

  // Manejar cambio de plantilla
  const handleTemplateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateName = e.target.value;
    setSelectedTemplate(templateName);

    if (templateName) {
      try {
        // Aquí normalmente cargaríamos la configuración de la plantilla seleccionada
        // Pero como es un ejemplo, usaremos una configuración predefinida
        const templateConfig: ReportConfig = {
          columns: config.columns,
          rowStyles: [
            {
              row: 1,
              font: { bold: true, color: { argb: 'FFFFFFFF' } },
              fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } }
            }
          ],
          cellStyles: [],
          merges: []
        };
        setConfig(templateConfig);
      } catch (error) {
        console.error('Error al cargar plantilla:', error);
        toast.error('Error al cargar la plantilla seleccionada');
      }
    }
  };

  // Guardar plantilla
  const saveTemplate = async () => {
    if (!templateName) {
      toast.error('Por favor, ingrese un nombre para la plantilla');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/reports/save-template', {
        name: templateName,
        config
      });
      toast.success('Plantilla guardada correctamente');
      
      // Actualizar lista de plantillas
      const response = await axios.get('/api/reports/templates');
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error al guardar plantilla:', error);
      toast.error('Error al guardar la plantilla');
    } finally {
      setLoading(false);
    }
  };

  // Generar y descargar reporte
  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/reports/generate', {
        data: previewData,
        config,
        templateName: selectedTemplate || undefined
      }, {
        responseType: 'blob'
      });

      // Crear URL para descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Reporte generado correctamente');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Enviar reporte por correo
  const sendReportByEmail = async () => {
    if (!email) {
      toast.error('Por favor, ingrese un correo electrónico');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/reports/send-email', {
        data: previewData,
        config,
        templateName: selectedTemplate || undefined,
        email,
        subject,
        message
      });
      
      toast.success('Reporte enviado correctamente');
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      toast.error('Error al enviar el reporte por correo');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar color de encabezado
  const changeHeaderColor = (color: string) => {
    const newRowStyles = [...config.rowStyles];
    const headerRowStyle = newRowStyles.find(style => style.row === 1);
    
    if (headerRowStyle && headerRowStyle.fill) {
      headerRowStyle.fill.fgColor.argb = color.replace('#', 'FF');
    } else {
      newRowStyles.push({
        row: 1,
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color.replace('#', 'FF') } }
      });
    }
    
    setConfig(prev => ({ ...prev, rowStyles: newRowStyles }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diseñador de Reportes Excel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Configuración del Reporte</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Plantilla</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedTemplate}
              onChange={handleTemplateChange}
            >
              <option value="">Seleccionar plantilla</option>
              {templates.map(template => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Color de Encabezados</label>
            <input 
              type="color" 
              className="p-1 border rounded"
              defaultValue="#4F81BD"
              onChange={(e) => changeHeaderColor(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Guardar como Plantilla</label>
            <div className="flex">
              <input 
                type="text"
                className="flex-1 p-2 border rounded-l"
                placeholder="Nombre de la plantilla"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-r"
                onClick={saveTemplate}
                disabled={loading}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Enviar por Correo</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
            <input 
              type="email"
              className="w-full p-2 border rounded"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Asunto</label>
            <input 
              type="text"
              className="w-full p-2 border rounded"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Mensaje</label>
            <textarea 
              className="w-full p-2 border rounded"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Vista Previa de Datos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-blue-500 text-white">
                {config.columns.map((column, index) => (
                  <th key={index} className="py-2 px-4 text-left">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {config.columns.map((column, colIndex) => (
                    <td key={colIndex} className="py-2 px-4 border-t">
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button 
          className="bg-green-500 text-white px-6 py-2 rounded"
          onClick={generateReport}
          disabled={loading}
        >
          {loading ? 'Generando...' : 'Descargar Reporte'}
        </button>
        
        <button 
          className="bg-blue-500 text-white px-6 py-2 rounded"
          onClick={sendReportByEmail}
          disabled={loading || !email}
        >
          {loading ? 'Enviando...' : 'Enviar por Correo'}
        </button>
      </div>
    </div>
  );
};

export default ReportDesigner;