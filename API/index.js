require('dotenv').config();
const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const app = express();
const server = http.createServer(app);
const fileUpload = require('express-fileupload');

// Inicializar Socket.IO
const socketIO = require('./sockets/io');
const io = socketIO.init(server);
const initSocketEvents = require('./sockets/initEvents');

// Configurar eventos de Socket.IO
initSocketEvents(io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Habilitar manejo de archivos (multipart/form-data)
app.use(fileUpload({
  createParentPath: true,
  useTempFiles: false
}));

// Servir archivos estáticos
app.use(express.static('public'));

// CORS middleware - Configuración simplificada
app.use((req, res, next) => {
  // Permitir solicitudes desde el frontend
  const origin = req.headers.origin;
  // Permitir solicitudes desde localhost:5173 o cualquier otro origen específico
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Importar rutas
const statusRoutes = require('./routes/status');
const docRoutes = require('./routes/doc');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const activityRoutes = require('./routes/activities');
const eventRoutes = require('./routes/events');
const guideRoutes = require('./routes/guides');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const passwordResetRoutes = require('./routes/passwordReset');

// Conectar a MongoDB de forma asíncrona
(async () => {
  try {
    await connectDB();
    console.log('✅ Conexión a MongoDB establecida');
  } catch (error) {
    console.error('⚠️ Error al conectar a MongoDB, pero el servidor continuará funcionando');
    console.error(error);
  }
})();

// Usar rutas
app.use('/', statusRoutes);
app.use('/doc', docRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/excel-shares', require('./routes/excelShares'));
app.use('/api/doc-shares', require('./routes/docShares'));
app.use('/api/password-reset', passwordResetRoutes);

// Importar manejadores de eventos de Socket.IO
const setupEventHandlers = require('./sockets/eventHandlers');

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  
  // Enviar estado inicial al conectar
  const statusData = getStatusData();
  socket.emit('api-status', statusData);
  
  // Enviar documentación inicial
  const docData = getDocData(socket.request);
  socket.emit('api-documentation', docData);
  
  // Manejar solicitudes de estado en tiempo real
  socket.on('request-status', () => {
    const statusData = getStatusData();
    socket.emit('api-status', statusData);
  });
  
  // Manejar solicitudes de documentación en tiempo real
  socket.on('request-documentation', () => {
    const docData = getDocData(socket.request);
    socket.emit('api-documentation', docData);
  });
  
  // Manejar solicitudes de métricas del sistema
  socket.on('request-metrics', () => {
    const metrics = getSystemMetrics();
    socket.emit('system-metrics', metrics);
  });
  
  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Configurar manejadores de eventos para cada módulo
setupEventHandlers(io);

// Función para obtener datos de estado
function getStatusData() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  return {
    status: 'online',
    service: 'SenaCloud API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      minutes: Math.floor(uptime / 60),
      hours: Math.floor(uptime / 3600),
      days: Math.floor(uptime / 86400)
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      }
    },
    endpoints: {
      available: [
        { path: '/', method: 'GET', description: 'Estado de la API' },
        { path: '/doc', method: 'GET', description: 'Documentación de la API' },
        { path: '/api/users', method: 'GET', description: 'Obtener todos los usuarios' },
        { path: '/api/users/:id', method: 'GET', description: 'Obtener un usuario específico' },
        { path: '/api/users', method: 'POST', description: 'Crear un nuevo usuario' },
        { path: '/api/users/:id', method: 'PUT', description: 'Actualizar un usuario' },
        { path: '/api/users/:id', method: 'DELETE', description: 'Eliminar un usuario' },
        { path: '/api/notifications', method: 'GET', description: 'Obtener todas las notificaciones' },
        { path: '/api/notifications/user/:userId', method: 'GET', description: 'Obtener notificaciones de un usuario' },
        { path: '/api/notifications', method: 'POST', description: 'Crear una nueva notificación' },
        { path: '/api/notifications/:id', method: 'PUT', description: 'Marcar notificación como leída' },
        { path: '/api/notifications/:id', method: 'DELETE', description: 'Eliminar una notificación' },
        { path: '/api/activities', method: 'GET', description: 'Obtener todas las actividades' },
        { path: '/api/activities/:id', method: 'GET', description: 'Obtener una actividad específica' },
        { path: '/api/activities', method: 'POST', description: 'Crear una nueva actividad' },
        { path: '/api/activities/:id', method: 'PUT', description: 'Actualizar una actividad' },
        { path: '/api/activities/:id', method: 'DELETE', description: 'Eliminar una actividad' },
        { path: '/api/events', method: 'GET', description: 'Obtener todos los eventos' },
        { path: '/api/events/:id', method: 'GET', description: 'Obtener un evento específico' },
        { path: '/api/events', method: 'POST', description: 'Crear un nuevo evento' },
        { path: '/api/events/:id', method: 'PUT', description: 'Actualizar un evento' },
        { path: '/api/events/:id', method: 'DELETE', description: 'Eliminar un evento' },
        { path: '/api/events/:id/participant/:userId', method: 'PUT', description: 'Actualizar estado de participante en evento' },
        { path: '/api/guides', method: 'GET', description: 'Obtener todas las guías' },
        { path: '/api/guides/:id', method: 'GET', description: 'Obtener una guía específica' },
        { path: '/api/guides', method: 'POST', description: 'Crear una nueva guía' },
        { path: '/api/guides/:id', method: 'PUT', description: 'Actualizar una guía' },
        { path: '/api/guides/:id/status', method: 'PUT', description: 'Cambiar estado de una guía' },
        { path: '/api/guides/:id', method: 'DELETE', description: 'Eliminar una guía' }
      ]
    },
    contact: {
      email: 'soporte@senacloud.com',
      website: 'https://senacloud.com',
      documentation: '/doc'
    },
    realtime: {
      connectedClients: io.engine.clientsCount,
      socketId: 'available'
    }
  };
}

// Función para obtener datos de documentación
function getDocData(req) {
  return {
    title: 'Documentación de la API de SenaCloud',
    description: 'API RESTful para servicios de SenaCloud con Socket.IO',
    version: '1.0.0',
    baseUrl: req && req.get ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3000',
    lastUpdated: new Date().toISOString(),
    
    authentication: {
      type: 'No requerida para endpoints básicos',
      note: 'Algunos endpoints pueden requerir autenticación en futuras versiones'
    },
    
    endpoints: [
      {
        path: '/',
        method: 'GET',
        description: 'Obtiene el estado actual de la API',
        parameters: 'Ninguno',
        realtime: 'Disponible via Socket.IO'
      },
      {
        path: '/doc',
        method: 'GET',
        description: 'Muestra esta documentación completa de la API',
        parameters: 'Ninguno',
        realtime: 'Disponible via Socket.IO'
      }
    ],
    
    socketEvents: [
      {
        event: 'api-status',
        description: 'Recibe actualizaciones del estado de la API',
        data: 'Objeto con información del estado del sistema'
      },
      {
        event: 'api-documentation',
        description: 'Recibe la documentación completa de la API',
        data: 'Objeto con toda la documentación'
      },
      {
        event: 'system-metrics',
        description: 'Recibe métricas detalladas del sistema',
        data: 'Objeto con métricas de rendimiento'
      },
      {
        event: 'request-status',
        description: 'Solicita actualización del estado de la API',
        data: 'Ninguno'
      },
      {
        event: 'request-documentation',
        description: 'Solicita actualización de la documentación',
        data: 'Ninguno'
      },
      {
        event: 'request-metrics',
        description: 'Solicita métricas del sistema',
        data: 'Ninguno'
      }
    ],
    
    errorCodes: {
      200: 'OK - Solicitud exitosa',
      400: 'Bad Request - Datos de entrada inválidos',
      404: 'Not Found - Recurso no encontrado',
      500: 'Internal Server Error - Error interno del servidor'
    },
    
    examples: {
      socketConnection: `
// Conectar con Socket.IO
const socket = io('http://localhost:3000');

// Escuchar actualizaciones de estado
socket.on('api-status', (data) => {
  console.log('Estado actualizado:', data);
});

// Solicitar estado actual
socket.emit('request-status');

// Escuchar documentación
socket.on('api-documentation', (data) => {
  console.log('Documentación:', data);
});

// Solicitar métricas del sistema
socket.emit('request-metrics');
socket.on('system-metrics', (data) => {
  console.log('Métricas:', data);
});`
    },
    
    contact: {
      email: 'soporte@senacloud.com',
      website: 'https://senacloud.com',
      github: 'https://github.com/senacloud/api',
      documentation: 'https://docs.senacloud.com'
    },
    
    changelog: [
      {
        version: '1.1.0',
        date: new Date().toISOString().split('T')[0],
        changes: [
          'Integración de Socket.IO para tiempo real',
          'Eventos de actualización automática',
          'Métricas del sistema en tiempo real',
          'Documentación actualizada con ejemplos de Socket.IO'
        ]
      },
      {
        version: '1.0.0',
        date: '2024-01-01',
        changes: [
          'Implementación inicial de la API',
          'Endpoint de estado del sistema',
          'Documentación automática'
        ]
      }
    ],
    
    upcomingFeatures: [
      'Autenticación JWT',
      'Rate limiting',
      'Logs detallados',
      'Métricas de rendimiento',
      'Webhooks',
      'API versioning',
      'Chat en tiempo real',
      'Notificaciones push'
    ]
  };
}

// Función para obtener métricas del sistema
function getSystemMetrics() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      minutes: Math.floor(uptime / 60),
      hours: Math.floor(uptime / 3600),
      days: Math.floor(uptime / 86400)
    },
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      unit: 'MB'
    },
    cpu: {
      user: Math.round(cpuUsage.user / 1000),
      system: Math.round(cpuUsage.system / 1000),
      unit: 'ms'
    },
    connections: {
      total: io.engine.clientsCount,
      active: io.engine.clientsCount
    },
    performance: {
      responseTime: 'N/A', // Se puede implementar con middleware
      requestsPerSecond: 'N/A' // Se puede implementar con contadores
    }
  };
}

// Actualizar estado cada 5 segundos para todos los clientes
setInterval(() => {
  const statusData = getStatusData();
  io.emit('api-status', statusData);
}, 5000);

// Actualizar métricas cada 10 segundos
setInterval(() => {
  const metrics = getSystemMetrics();
  io.emit('system-metrics', metrics);
}, 10000);

// Middleware para manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`,
    availableEndpoints: [
      { path: '/', method: 'GET', description: 'Estado de la API' },
      { path: '/doc', method: 'GET', description: 'Documentación de la API' }
    ],
    socketEvents: [
      { event: 'api-status', description: 'Estado en tiempo real' },
      { event: 'api-documentation', description: 'Documentación en tiempo real' },
      { event: 'system-metrics', description: 'Métricas del sistema' }
    ],
    timestamp: new Date().toISOString()
  });
});

// Middleware para manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ha ocurrido un error inesperado',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor de SenaCloud API corriendo en el puerto ${PORT}`);
  console.log(`📊 Estado de la API: http://localhost:${PORT}/`);
  console.log(`📚 Documentación: http://localhost:${PORT}/doc`);
  console.log(`🔌 Socket.IO habilitado para tiempo real`);
});
