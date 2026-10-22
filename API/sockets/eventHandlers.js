const User = require('../models/User');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const Event = require('../models/Event');

module.exports = function(io) {
  // Namespace para usuarios
  const userNamespace = io.of('/users');
  userNamespace.on('connection', (socket) => {
    console.log('Cliente conectado a namespace de usuarios');

    // Escuchar cambios en usuarios - optimizado para respuesta inmediata
    socket.on('user-created', async (userData) => {
      // Emitir respuesta inmediata al cliente que realizó la acción
      socket.emit('user-added', userData);
      // Luego actualizar a todos los clientes
      const users = await User.find().lean();
      userNamespace.emit('users-updated', users);
    });

    socket.on('user-updated', async (userData) => {
      // Emitir respuesta inmediata al cliente que realizó la acción
      socket.emit('user-updated', userData);
      // Luego actualizar a todos los clientes
      const users = await User.find().lean();
      userNamespace.emit('users-updated', users);
    });

    socket.on('user-deleted', async (userId) => {
      // Emitir respuesta inmediata al cliente que realizó la acción
      socket.emit('user-deleted', { id: userId });
      // Luego actualizar a todos los clientes
      const users = await User.find().lean();
      userNamespace.emit('users-updated', users);
    });

    // Escuchar actualizaciones de estado de coordinadores
    socket.on('update-coordinator-status', async (data) => {
      try {
        const { coordinadorId, status } = data;
        const user = await User.findById(coordinadorId);
        
        if (!user) {
          socket.emit('error', { message: 'Coordinador no encontrado' });
          return;
        }
        
        if (user.rol !== 'Coordinacion') {
          socket.emit('error', { message: 'El usuario no es un coordinador' });
          return;
        }
        
        user.estadoCoordinador = status;
        await user.save();
        
        // Emitir evento de actualización
        userNamespace.emit('coordinator-status-updated', {
          coordinadorId: user._id,
          status: user.estadoCoordinador
        });
        
        // Respuesta inmediata al cliente que realizó la acción
        socket.emit('status-update-success', {
          coordinadorId: user._id,
          status: user.estadoCoordinador
        });
        
        console.log(`Estado de coordinador ${coordinadorId} actualizado a ${status}`);
      } catch (error) {
        console.error('Error al actualizar estado de coordinador:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    // Escuchar actualizaciones de estado de administradores
    socket.on('update-admin-status', async (data) => {
      try {
        const { administradorId, status } = data;
        const user = await User.findById(administradorId);
        
        if (!user) {
          socket.emit('error', { message: 'Administrador no encontrado' });
          return;
        }
        
        if (user.rol !== 'Administracion') {
          socket.emit('error', { message: 'El usuario no es un administrador' });
          return;
        }
        
        user.estadoAdministrador = status;
        await user.save();
        
        // Emitir evento de actualización a todos los clientes
        userNamespace.emit('admin-status-updated', {
          administradorId: user._id,
          status: user.estadoAdministrador
        });
        
        // Respuesta inmediata al cliente que realizó la acción
        socket.emit('status-update-success', {
          administradorId: user._id,
          status: user.estadoAdministrador
        });
        
        console.log(`Estado de administrador ${administradorId} actualizado a ${status}`);
      } catch (error) {
        console.error('Error al actualizar estado de administrador:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Obtener detalles de un usuario específico
    socket.on('get-user-details', async (data) => {
      try {
        const { id } = data;
        const user = await User.findById(id).lean();
        
        if (!user) {
          socket.emit('error', { message: 'Usuario no encontrado' });
          return;
        }
        
        // Emitir los detalles del usuario sin validar el rol
        socket.emit('user-details', user);
        console.log(`Detalles del usuario ${id} enviados`);
      } catch (error) {
        console.error('Error al obtener detalles del usuario:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    // Obtener lista de usuarios por rol
    socket.on('get-users', async (data) => {
      try {
        const { rol } = data || {};
        let query = {};
        
        if (rol) {
          query.rol = rol;
        }
        
        const users = await User.find(query).lean();
        socket.emit('users-list', users);
        console.log(`Lista de usuarios${rol ? ' con rol ' + rol : ''} enviada`);
      } catch (error) {
        console.error('Error al obtener lista de usuarios:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    // Obtener detalles de un usuario específico
    socket.on('get-user-detail', async (data) => {
      try {
        const { id } = data;
        const user = await User.findById(id).lean();
        
        if (!user) {
          socket.emit('error', { message: 'Usuario no encontrado' });
          return;
        }
        
        socket.emit('user-detail', user);
        console.log(`Detalles del usuario ${id} enviados`);
      } catch (error) {
        console.error('Error al obtener detalles del usuario:', error);
        socket.emit('error', { message: error.message });
      }
    });
  });

  // Namespace para notificaciones
  const notificationNamespace = io.of('/notifications');
  notificationNamespace.on('connection', (socket) => {
    console.log('Cliente conectado a namespace de notificaciones');

    // Escuchar cambios en notificaciones
    socket.on('notification-created', async (notificationData) => {
      const notifications = await Notification.find().populate('destinatario');
      notificationNamespace.emit('notifications-updated', notifications);
    });

    socket.on('notification-read', async (notificationId) => {
      const notifications = await Notification.find().populate('destinatario');
      notificationNamespace.emit('notifications-updated', notifications);
    });

    socket.on('notification-deleted', async (notificationId) => {
      const notifications = await Notification.find().populate('destinatario');
      notificationNamespace.emit('notifications-updated', notifications);
    });
  });

  // Namespace para actividades
  const activityNamespace = io.of('/activities');
  activityNamespace.on('connection', (socket) => {
    console.log('Cliente conectado a namespace de actividades');

    // Escuchar cambios en actividades
    socket.on('activity-created', async (activityData) => {
      const activities = await Activity.find()
        .populate('responsable')
        .populate('participantes');
      activityNamespace.emit('activities-updated', activities);
    });

    socket.on('activity-updated', async (activityData) => {
      const activities = await Activity.find()
        .populate('responsable')
        .populate('participantes');
      activityNamespace.emit('activities-updated', activities);
    });

    socket.on('activity-deleted', async (activityId) => {
      const activities = await Activity.find()
        .populate('responsable')
        .populate('participantes');
      activityNamespace.emit('activities-updated', activities);
    });
  });

  // Namespace para eventos
  const eventNamespace = io.of('/events');
  eventNamespace.on('connection', (socket) => {
    console.log('Cliente conectado a namespace de eventos');

    // Escuchar cambios en eventos
    socket.on('event-created', async (eventData) => {
      const events = await Event.find()
        .populate('organizador')
        .populate('participantes.usuario');
      eventNamespace.emit('events-updated', events);
    });

    socket.on('event-updated', async (eventData) => {
      const events = await Event.find()
        .populate('organizador')
        .populate('participantes.usuario');
      eventNamespace.emit('events-updated', events);
    });

    socket.on('event-deleted', async (eventId) => {
      const events = await Event.find()
        .populate('organizador')
        .populate('participantes.usuario');
      eventNamespace.emit('events-updated', events);
    });

    socket.on('participant-status-updated', async (data) => {
      const events = await Event.find()
        .populate('organizador')
        .populate('participantes.usuario');
      eventNamespace.emit('events-updated', events);
    });
  });
};