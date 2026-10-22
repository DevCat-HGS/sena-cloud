import React, { useEffect, useState } from 'react';
import { Card, List, Button, Badge, message, Spin } from 'antd';
import axios from 'axios';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { downloadExcel } from '../Service/API/reportService';

interface ReceivedExcel {
  _id: string;
  fileId: string;
  fileName: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
  sentAt: string;
  isRead: boolean;
}

const ReceivedExcels: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [receivedExcels, setReceivedExcels] = useState<ReceivedExcel[]>([]);

  useEffect(() => {
    fetchReceivedExcels();
  }, []);

  const fetchReceivedExcels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await axios.get(`http://localhost:3001/api/excel-shares/received/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReceivedExcels(response.data);
    } catch (error) {
      console.error('Error al obtener archivos Excel recibidos:', error);
      message.error('Error al cargar los archivos Excel recibidos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      await downloadExcel(fileId);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      message.error('Error al descargar el archivo');
    }
  };

  const markAsRead = async (shareId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/excel-shares/read/${shareId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualizar el estado local
      setReceivedExcels(prevExcels => 
        prevExcels.map(excel => 
          excel._id === shareId ? { ...excel, isRead: true } : excel
        )
      );
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

  return (
    <Card title="Archivos Excel Recibidos" extra={<Button onClick={fetchReceivedExcels}>Actualizar</Button>}>
      <Spin spinning={loading}>
        {receivedExcels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No hay archivos Excel recibidos
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={receivedExcels}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button 
                    icon={<EyeOutlined />} 
                    onClick={() => {
                      handleDownload(item.fileId);
                      markAsRead(item._id);
                    }}
                  >
                    Ver
                  </Button>,
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={() => {
                      handleDownload(item.fileId);
                      markAsRead(item._id);
                    }}
                  >
                    Descargar
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div>
                      {!item.isRead && <Badge status="processing" color="blue" style={{ marginRight: 8 }} />}
                      {item.fileName}
                    </div>
                  }
                  description={`Enviado por: ${item.senderId.name} (${item.senderId.email}) - ${new Date(item.sentAt).toLocaleString()}`}
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  );
};

export default ReceivedExcels;