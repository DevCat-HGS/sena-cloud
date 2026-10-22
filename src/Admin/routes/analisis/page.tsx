import { useState, useEffect } from "react";
import { Footer } from "../../layouts/footer";
import { API_URL, USER_ROUTES, ACTIVITY_ROUTES, EVENT_ROUTES } from "../../../Service/API/apiRoutes";
import { Table, Spin, Alert, Tabs, Modal, Button, Descriptions, Space } from "antd";
import { EyeOutlined } from "@ant-design/icons";

// Interfaces para los datos
interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
}

interface Actividad {
  _id: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  estado: string;
  creador: string;
}

interface Evento {
  _id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: string;
  creador: string;
}

// Componente principal
const AnalisisPage = () => {
    // Estados para almacenar los datos
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Estado para el modal de detalles
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

    // Estadísticas calculadas
    const [estadisticas, setEstadisticas] = useState({
        totalUsuarios: 0,
        usuariosPorRol: {} as Record<string, number>,
        usuariosPorEstado: {} as Record<string, number>,
        totalActividades: 0,
        actividadesPorEstado: {} as Record<string, number>,
        totalEventos: 0,
        eventosPorTipo: {} as Record<string, number>
    });

    // Cargar datos al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Obtener usuarios
                const usuariosResponse = await fetch(`${API_URL}${USER_ROUTES.GET_ALL}`, {
                    credentials: 'include'
                });
                
                if (!usuariosResponse.ok) {
                    throw new Error('Error al cargar usuarios');
                }
                
                const usuariosData = await usuariosResponse.json();
                setUsuarios(usuariosData);
                
                // Obtener actividades
                const actividadesResponse = await fetch(`${API_URL}${ACTIVITY_ROUTES.GET_ALL}`, {
                    credentials: 'include'
                });
                
                if (!actividadesResponse.ok) {
                    throw new Error('Error al cargar actividades');
                }
                
                const actividadesData = await actividadesResponse.json();
                setActividades(actividadesData);
                
                // Obtener eventos
                const eventosResponse = await fetch(`${API_URL}/api/events`, {
                    credentials: 'include'
                });
                
                if (!eventosResponse.ok) {
                    throw new Error('Error al cargar eventos');
                }
                
                const eventosData = await eventosResponse.json();
                setEventos(eventosData);
                
                // Calcular estadísticas
                calcularEstadisticas(usuariosData, actividadesData, eventosData);
                
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los datos. Por favor, intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    // Función para calcular estadísticas
    const calcularEstadisticas = (usuarios: Usuario[], actividades: Actividad[], eventos: Evento[]) => {
        // Estadísticas de usuarios
        const usuariosPorRol: Record<string, number> = {};
        const usuariosPorEstado: Record<string, number> = {};
        
        usuarios.forEach(usuario => {
            // Contar por rol
            if (usuariosPorRol[usuario.rol]) {
                usuariosPorRol[usuario.rol]++;
            } else {
                usuariosPorRol[usuario.rol] = 1;
            }
            
            // Contar por estado
            if (usuariosPorEstado[usuario.estado]) {
                usuariosPorEstado[usuario.estado]++;
            } else {
                usuariosPorEstado[usuario.estado] = 1;
            }
        });
        
        // Estadísticas de actividades
        const actividadesPorEstado: Record<string, number> = {};
        
        actividades.forEach(actividad => {
            if (actividadesPorEstado[actividad.estado]) {
                actividadesPorEstado[actividad.estado]++;
            } else {
                actividadesPorEstado[actividad.estado] = 1;
            }
        });
        
        // Estadísticas de eventos
        const eventosPorTipo: Record<string, number> = {};
        
        eventos.forEach(evento => {
            if (eventosPorTipo[evento.tipo]) {
                eventosPorTipo[evento.tipo]++;
            } else {
                eventosPorTipo[evento.tipo] = 1;
            }
        });
        
        // Actualizar estado de estadísticas
        setEstadisticas({
            totalUsuarios: usuarios.length,
            usuariosPorRol,
            usuariosPorEstado,
            totalActividades: actividades.length,
            actividadesPorEstado,
            totalEventos: eventos.length,
            eventosPorTipo
        });
    };
    
    // Función para mostrar el modal con detalles del usuario
    const mostrarDetallesUsuario = (usuario: Usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalVisible(true);
    };

    // Columnas para la tabla de usuarios
    const columnasUsuarios = [
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            ellipsis: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            render: (text: string) => text ? <a href={`mailto:${text}`}>{text}</a> : '-',
            width: 200,
        },
        {
            title: 'Rol',
            dataIndex: 'rol',
            key: 'rol',
            ellipsis: true,
            filters: Object.keys(estadisticas.usuariosPorRol).map(rol => ({ text: rol, value: rol })),
            onFilter: (value: any, record: Usuario) => record.rol === value,
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            ellipsis: true,
            filters: (() => {
                // Solo mostrar 'aprobado' o 'pendiente' para instructores
                if (Object.keys(estadisticas.usuariosPorRol || {}).includes('Instructor')) {
                    return ['aprobado', 'pendiente'].map(estado => ({ text: estado, value: estado }));
                }
                return Object.keys(estadisticas.usuariosPorEstado || {}).map(estado => ({ text: estado, value: estado }));
            })(),
            onFilter: (value: any, record: Usuario) => {
                // Si es instructor, solo filtrar por 'aprobado' o 'pendiente'
                if (record.rol === 'Instructor') {
                    return record.estado === value && (value === 'aprobado' || value === 'pendiente');
                }
                // Para otros roles, mostrar todos los estados
                return record.estado === value;
            },
            render: (text: string, record: Usuario) => {
                if (record.rol === 'Instructor') {
                    return text === 'aprobado' ? 'Aprobado' : text === 'pendiente' ? 'Pendiente' : '-';
                }
                return text || '-';
            },
        },
        {
            title: 'Acciones',
            key: 'acciones',
            width: 80,
            render: (_: any, record: Usuario) => (
                <Button 
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={() => mostrarDetallesUsuario(record)}
                    title="Ver detalles completos"
                />
            ),
        }
    ];

    
    // Columnas para la tabla de actividades
    const columnasActividades = [
        {
            title: 'Título',
            dataIndex: 'titulo',
            key: 'titulo',
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            ellipsis: true,
        },
        {
            title: 'Fecha de Creación',
            dataIndex: 'fechaCreacion',
            key: 'fechaCreacion',
            render: (text: string) => new Date(text).toLocaleDateString(),
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            filters: Object.keys(estadisticas.actividadesPorEstado || {}).map(estado => ({ text: estado, value: estado })),
            onFilter: (value: any, record: Actividad) => record.estado === value,
        }
    ];
    
    // Columnas para la tabla de eventos
    const columnasEventos = [
        {
            title: 'Título',
            dataIndex: 'titulo',
            key: 'titulo',
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            ellipsis: true,
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            render: (text: string) => new Date(text).toLocaleDateString(),
        },
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            filters: Object.keys(estadisticas.eventosPorTipo || {}).map(tipo => ({ text: tipo, value: tipo })),
            onFilter: (value: any, record: Evento) => record.tipo === value,
        }
    ];

    // Renderizar componente
    return (
        <div className="flex flex-col gap-y-4 rounded-2xl">
            <h1 className="title">Análisis de Datos</h1>
            
            {/* Modal para mostrar detalles completos del usuario */}
            <Modal
                title="Detalles del Usuario"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="cerrar" onClick={() => setModalVisible(false)}>
                        Cerrar
                    </Button>
                ]}
                width={700}
            >
                {usuarioSeleccionado && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Nombre">{usuarioSeleccionado.nombre}</Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <a href={`mailto:${usuarioSeleccionado.email}`}>{usuarioSeleccionado.email}</a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Rol">{usuarioSeleccionado.rol}</Descriptions.Item>
                        <Descriptions.Item label="Estado">
                            {usuarioSeleccionado.rol === 'Instructor' && 
                             (usuarioSeleccionado.estado !== 'aprobado' && usuarioSeleccionado.estado !== 'pendiente') 
                                ? '-' 
                                : usuarioSeleccionado.estado}
                        </Descriptions.Item>
                        <Descriptions.Item label="ID">{usuarioSeleccionado._id}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
            
            {loading ? (
                <div className="flex items-center justify-center h-64 flex-col">
                    <Spin size="large" />
                    <div className="mt-2">Cargando datos...</div>
                </div>
            ) : error ? (
                <Alert message="Error" description={error} type="error" showIcon />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {/* Métricas principales */}
                    <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-slate-900">
                        <h2 className="text-xl font-semibold mb-4">Métricas Clave</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Total Usuarios</h3>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{estadisticas.totalUsuarios}</p>
                                <div className="mt-2">
                                    {Object.entries(estadisticas.usuariosPorRol).map(([rol, cantidad]) => (
                                        <p key={rol} className="text-sm text-green-600 dark:text-green-400">
                                            {rol}: {cantidad} ({((cantidad / estadisticas.totalUsuarios) * 100).toFixed(1)}%)
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">Total Actividades</h3>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{estadisticas.totalActividades}</p>
                                <div className="mt-2">
                                    {Object.entries(estadisticas.actividadesPorEstado).map(([estado, cantidad]) => (
                                        <p key={estado} className="text-sm text-blue-600 dark:text-blue-400">
                                            {estado}: {cantidad} ({((cantidad / estadisticas.totalActividades) * 100).toFixed(1)}%)
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300">Total Eventos</h3>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{estadisticas.totalEventos}</p>
                                <div className="mt-2">
                                    {Object.entries(estadisticas.eventosPorTipo).map(([tipo, cantidad]) => (
                                        <p key={tipo} className="text-sm text-purple-600 dark:text-purple-400">
                                            {tipo}: {cantidad} ({((cantidad / estadisticas.totalEventos) * 100).toFixed(1)}%)
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tablas de datos */}
                    <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-slate-900">
                        <Tabs 
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: '1',
                                    label: 'Usuarios',
                                    children: (
                                        <Table 
                                            dataSource={usuarios} 
                                            columns={columnasUsuarios} 
                                            rowKey="_id"
                                            pagination={{ pageSize: 10 }}
                                            scroll={{ x: true }}
                                        />
                                    )
                                },
                                {
                                    key: '2',
                                    label: 'Actividades',
                                    children: (
                                        <Table 
                                            dataSource={actividades} 
                                            columns={columnasActividades} 
                                            rowKey="_id"
                                            pagination={{ pageSize: 10 }}
                                            scroll={{ x: true }}
                                        />
                                    )
                                },
                                {
                                    key: '3',
                                    label: 'Eventos',
                                    children: (
                                        <Table 
                                            dataSource={eventos} 
                                            columns={columnasEventos} 
                                            rowKey="_id"
                                            pagination={{ pageSize: 10 }}
                                            scroll={{ x: true }}
                                        />
                                    )
                                }
                            ]}
                        />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default AnalisisPage;