/**
 * Eventos de Socket.IO para la gestión de administradores
 */

const User = require('../models/User');
const mongoose = require('mongoose');

module.exports = function(io) {
  // Namespace específico para eventos relacionados con administradores
  const adminNamespace = io.of('/administrators');
  
  // Middleware para autenticación (ejemplo)
  adminNamespace.use((socket, next) => {
    // Aquí se podría implementar autenticación
    next();
  });

  adminNamespace.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado al namespace de administradores: ${socket.id}`);
    
    // Obtener lista de administradores
    socket.on('get-administrators', async () => {
      try {
        const administradores = await User.find({ rol: 'Administracion' });
        socket.emit('administrators-list', administradores);
      } catch (error) {
        console.error('Error al obtener administradores:', error);
        socket.emit('error', { message: 'Error al obtener administradores' });
      }
    });

    // Obtener un administrador específico
    socket.on('get-administrator', async ({ id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return socket.emit('error', { message: 'ID de administrador inválido' });
        }

        const administrador = await User.findOne({ _id: id, rol: 'Administracion' });
        
        if (!administrador) {
          return socket.emit('error', { message: 'Administrador no encontrado' });
        }
        
        socket.emit('administrator-data', administrador);
      } catch (error) {
        console.error('Error al obtener administrador:', error);
        socket.emit('error', { message: 'Error al obtener administrador' });
      }
    });

    // Crear un nuevo administrador
    socket.on('create-administrator', async (administradorData) => {
      try {
        if (!administradorData.nombre || !administradorData.correoInstitucional) {
          return socket.emit('error', { message: 'Datos incompletos' });
        }
        
        if (!administradorData.correoInstitucional.endsWith('@sena.edu.co')) {
          return socket.emit('error', { message: 'El correo institucional debe terminar en @sena.edu.co' });
        }
        
        const administrador = new User({
          ...administradorData,
          rol: 'Administracion',
          estadoAdministrador: 'pendiente'
        });
        
        await administrador.save();
        
        adminNamespace.emit('administrator-created', administrador);
        socket.emit('administrator-created', administrador);
      } catch (error) {
        console.error('Error al crear administrador:', error);
        socket.emit('error', { message: error.message || 'Error al crear administrador' });
      }
    });

    // Actualizar un administrador
    socket.on('update-administrator', async ({ id, ...administradorData }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return socket.emit('error', { message: 'ID de administrador inválido' });
        }
        
        if (administradorData.correoInstitucional && !administradorData.correoInstitucional.endsWith('@sena.edu.co')) {
          return socket.emit('error', { message: 'El correo institucional debe terminar en @sena.edu.co' });
        }
        
        const administrador = await User.findById(id);
        
        if (!administrador) {
          return socket.emit('error', { message: 'Administrador no encontrado' });
        }
        
        if (administrador.rol !== 'Administracion') {
          return socket.emit('error', { message: 'El usuario no es un administrador' });
        }
        
        Object.assign(administrador, administradorData);
        await administrador.save();
        
        adminNamespace.emit('administrator-updated', administrador);
        socket.emit('administrator-updated', administrador);
      } catch (error) {
        console.error('Error al actualizar administrador:', error);
        socket.emit('error', { message: error.message || 'Error al actualizar administrador' });
      }
    });
    
    // Eliminar un administrador
    socket.on('delete-administrator', async ({ id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return socket.emit('error', { message: 'ID de administrador inválido' });
        }
        
        const administrador = await User.findById(id);
        
        if (!administrador) {
          return socket.emit('error', { message: 'Administrador no encontrado' });
        }
        
        if (administrador.rol !== 'Administracion') {
          return socket.emit('error', { message: 'El usuario no es un administrador' });
        }
        
        await User.findByIdAndDelete(id);
        
        adminNamespace.emit('administrator-deleted', { id });
        socket.emit('administrator-deleted', { id });
      } catch (error) {
        console.error('Error al eliminar administrador:', error);
        socket.emit('error', { message: error.message || 'Error al eliminar administrador' });
      }
    });
    
    // Actualizar estado de un administrador
    socket.on('update-administrator-status', async ({ administradorId, status }) => {
      try {
        if (!administradorId || !status) {
          return socket.emit('error', { message: 'Datos incompletos' });
        }
        
        if (status !== 'pendiente' && status !== 'aprobado') {
          return socket.emit('error', { message: 'Estado no válido' });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
          administradorId,
          { estadoAdministrador: status },
          { new: true }
        );
        
        if (!updatedUser) {
          return socket.emit('error', { message: 'Administrador no encontrado' });
        }
        
        adminNamespace.emit('administrator-status-updated', {
          administradorId,
          status,
          timestamp: new Date().toISOString()
        });
        
        socket.emit('status-update-success', {
          message: 'Estado actualizado correctamente',
          administrador: {
            id: updatedUser._id,
            nombre: updatedUser.nombre,
            email: updatedUser.email,
            estadoAdministrador: updatedUser.estadoAdministrador
          }
        });
      } catch (error) {
        console.error('Error al actualizar estado del administrador:', error);
        socket.emit('error', { message: error.message || 'Error al actualizar estado' });
      }
    });
  });
};