/**
 * Eventos de Socket.IO para la gestión de coordinadores
 */

const User = require('../models/User');
const mongoose = require('mongoose');

module.exports = function(io) {
  // Namespace específico para eventos relacionados con coordinadores
  const coordinatorNamespace = io.of('/coordinators');
  
  // Middleware para autenticación (ejemplo)
  coordinatorNamespace.use((socket, next) => {
    // Aquí se podría implementar autenticación
    next();
  });

  coordinatorNamespace.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado al namespace de coordinadores: ${socket.id}`);
    
    // Obtener lista de coordinadores
    socket.on('get-coordinators', async () => {
      try {
        const coordinadores = await User.find({ rol: 'Coordinacion' });
        socket.emit('coordinators-list', coordinadores);
      } catch (error) {
        console.error('Error al obtener coordinadores:', error);
        socket.emit('error', { message: 'Error al obtener coordinadores' });
      }
    });

    // Obtener un coordinador específico
    socket.on('get-coordinator', async ({ id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return socket.emit('error', { message: 'ID de coordinador inválido' });
        }

        const coordinador = await User.findOne({ _id: id, rol: 'Coordinacion' });
        
        if (!coordinador) {
          return socket.emit('error', { message: 'Coordinador no encontrado' });
        }
        
        socket.emit('coordinator-data', coordinador);
      } catch (error) {
        console.error('Error al obtener coordinador:', error);
        socket.emit('error', { message: 'Error al obtener coordinador' });
      }
    });

    // Crear un nuevo coordinador
    socket.on('create-coordinator', async (coordinadorData) => {
      try {
        if (!coordinadorData.nombre || !coordinadorData.correoInstitucional) {
          return socket.emit('error', { message: 'Datos incompletos' });
        }
        
        if (!coordinadorData.correoInstitucional.endsWith('@sena.edu.co')) {
          return socket.emit('error', { message: 'El correo institucional debe terminar en @sena.edu.co' });
        }
        
        const coordinador = new User({
          ...coordinadorData,
          rol: 'Coordinacion',
          estadoCoordinador: 'pendiente'
        });
        
        await coordinador.save();
        
        coordinatorNamespace.emit('coordinator-created', coordinador);
        socket.emit('coordinator-created', coordinador);
      } catch (error) {
        console.error('Error al crear coordinador:', error);
        socket.emit('error', { message: error.message || 'Error al crear coordinador' });
      }
    });

    // Actualizar un coordinador
    socket.on('update-coordinator', async ({ id, ...coordinadorData }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return socket.emit('error', { message: 'ID de coordinador inválido' });
        }
        
        if (coordinadorData.correoInstitucional && !coordinadorData.correoInstitucional.endsWith('@sena.edu.co')) {
          return socket.emit('error', { message: 'El correo institucional debe terminar en @sena.edu.co' });
        }
        
        const coordinador = await User.findById(id);
        
        if (!coordinador) {
          return socket.emit('error', { message: 'Coordinador no encontrado' });
        }
        
        if (coordinador.rol !== 'Coordinacion') {
          return socket.emit('error', { message: 'El usuario no es un coordinador' });
        }
        
        Object.assign(coordinador, coordinadorData);
        await coordinador.save();
        
        coordinatorNamespace.emit('coordinator-updated', coordinador);
        socket.emit('coordinator-updated', coordinador);
      } catch (error) {
        console.error('Error al actualizar coordinador:', error);
        socket.emit('error', { message: error.message || 'Error al actualizar coordinador' });
      }
    });
    
    // Eliminar un coordinador
    socket.on('delete-coordinator', async ({ id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return socket.emit('error', { message: 'ID de coordinador inválido' });
        }
        
        const coordinador = await User.findById(id);
        
        if (!coordinador) {
          return socket.emit('error', { message: 'Coordinador no encontrado' });
        }
        
        if (coordinador.rol !== 'Coordinacion') {
          return socket.emit('error', { message: 'El usuario no es un coordinador' });
        }
        
        await User.findByIdAndDelete(id);
        
        coordinatorNamespace.emit('coordinator-deleted', { id });
        socket.emit('coordinator-deleted', { id });
      } catch (error) {
        console.error('Error al eliminar coordinador:', error);
        socket.emit('error', { message: error.message || 'Error al eliminar coordinador' });
      }
    });
    
    // Actualizar estado de un coordinador
    socket.on('update-coordinator-status', async ({ coordinadorId, status }) => {
      try {
        if (!coordinadorId || !status) {
          return socket.emit('error', { message: 'Datos incompletos' });
        }
        
        if (status !== 'pendiente' && status !== 'aprobado') {
          return socket.emit('error', { message: 'Estado no válido' });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
          coordinadorId,
          { estadoCoordinador: status },
          { new: true }
        );
        
        if (!updatedUser) {
          return socket.emit('error', { message: 'Coordinador no encontrado' });
        }
        
        coordinatorNamespace.emit('coordinator-status-updated', {
          coordinadorId,
          status,
          timestamp: new Date().toISOString()
        });
        
        socket.emit('status-update-success', {
          message: 'Estado actualizado correctamente',
          coordinador: {
            id: updatedUser._id,
            nombre: updatedUser.nombre,
            email: updatedUser.email,
            estadoCoordinador: updatedUser.estadoCoordinador
          }
        });
      } catch (error) {
        console.error('Error al actualizar estado del coordinador:', error);
        socket.emit('error', { message: error.message || 'Error al actualizar estado' });
      }
    });
  });
};