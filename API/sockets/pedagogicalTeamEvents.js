/**
 * Eventos de Socket.IO para la gestión del equipo pedagógico
 */

const User = require('../models/User');
const mongoose = require('mongoose');

module.exports = function(io) {
  // Namespace específico para eventos relacionados con el equipo pedagógico
  const pedagogicalTeamNamespace = io.of('/pedagogical-team');
  
  // Middleware para autenticación (ejemplo)
  pedagogicalTeamNamespace.use((socket, next) => {
    // Aquí se podría implementar autenticación
    next();
  });

  pedagogicalTeamNamespace.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado al namespace del equipo pedagógico: ${socket.id}`);
    
    // Obtener lista del equipo pedagógico
    socket.on('get-pedagogical-team', async () => {
      try {
        const equipoPedagogico = await User.find({ rol: 'EquipoPedagogico' });
        socket.emit('pedagogical-team-list', equipoPedagogico);
      } catch (error) {
        console.error('Error al obtener equipo pedagógico:', error);
        socket.emit('error', { message: 'Error al obtener equipo pedagógico' });
      }
    });

    // Obtener un miembro específico del equipo pedagógico
    socket.on('get-pedagogical-member', async ({ id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return socket.emit('error', { message: 'ID de miembro inválido' });
        }

        const miembro = await User.findOne({ _id: id, rol: 'EquipoPedagogico' });
        
        if (!miembro) {
          return socket.emit('error', { message: 'Miembro no encontrado' });
        }
        
        socket.emit('pedagogical-member-data', miembro);
      } catch (error) {
        console.error('Error al obtener miembro:', error);
        socket.emit('error', { message: 'Error al obtener miembro' });
      }
    });

    // Crear un nuevo miembro del equipo pedagógico
    socket.on('create-pedagogical-member', async (miembroData) => {
      try {
        if (!miembroData.nombre || !miembroData.correoInstitucional) {
          return socket.emit('error', { message: 'Datos incompletos' });
        }
        
        if (!miembroData.correoInstitucional.endsWith('@sena.edu.co')) {
          return socket.emit('error', { message: 'El correo institucional debe terminar en @sena.edu.co' });
        }
        
        const miembro = new User({
          ...miembroData,
          rol: 'EquipoPedagogico',
          estadoEquipoPedagogico: 'pendiente'
        });
        
        await miembro.save();
        
        pedagogicalTeamNamespace.emit('pedagogical-member-created', miembro);
        socket.emit('pedagogical-member-created', miembro);
      } catch (error) {
        console.error('Error al crear miembro:', error);
        socket.emit('error', { message: error.message || 'Error al crear miembro' });
      }
    });

    // Actualizar un miembro del equipo pedagógico
    socket.on('update-pedagogical-member', async ({ id, ...miembroData }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return socket.emit('error', { message: 'ID de miembro inválido' });
        }
        
        if (miembroData.correoInstitucional && !miembroData.correoInstitucional.endsWith('@sena.edu.co')) {
          return socket.emit('error', { message: 'El correo institucional debe terminar en @sena.edu.co' });
        }
        
        const miembro = await User.findById(id);
        
        if (!miembro) {
          return socket.emit('error', { message: 'Miembro no encontrado' });
        }
        
        if (miembro.rol !== 'EquipoPedagogico') {
          return socket.emit('error', { message: 'El usuario no es miembro del equipo pedagógico' });
        }
        
        Object.assign(miembro, miembroData);
        await miembro.save();
        
        pedagogicalTeamNamespace.emit('pedagogical-member-updated', miembro);
        socket.emit('pedagogical-member-updated', miembro);
      } catch (error) {
        console.error('Error al actualizar miembro:', error);
        socket.emit('error', { message: error.message || 'Error al actualizar miembro' });
      }
    });
    
    // Eliminar un miembro del equipo pedagógico
    socket.on('delete-pedagogical-member', async ({ id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return socket.emit('error', { message: 'ID de miembro inválido' });
        }
        
        const miembro = await User.findById(id);
        
        if (!miembro) {
          return socket.emit('error', { message: 'Miembro no encontrado' });
        }
        
        if (miembro.rol !== 'EquipoPedagogico') {
          return socket.emit('error', { message: 'El usuario no es miembro del equipo pedagógico' });
        }
        
        await User.findByIdAndDelete(id);
        
        pedagogicalTeamNamespace.emit('pedagogical-member-deleted', { id });
        socket.emit('pedagogical-member-deleted', { id });
      } catch (error) {
        console.error('Error al eliminar miembro:', error);
        socket.emit('error', { message: error.message || 'Error al eliminar miembro' });
      }
    });
    
    // Actualizar estado de un miembro del equipo pedagógico
    socket.on('update-pedagogical-member-status', async ({ miembroId, status }) => {
      try {
        if (!miembroId || !status) {
          return socket.emit('error', { message: 'Datos incompletos' });
        }
        
        if (status !== 'pendiente' && status !== 'aprobado') {
          return socket.emit('error', { message: 'Estado no válido' });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
          miembroId,
          { estadoEquipoPedagogico: status },
          { new: true }
        );
        
        if (!updatedUser) {
          return socket.emit('error', { message: 'Miembro no encontrado' });
        }
        
        pedagogicalTeamNamespace.emit('pedagogical-member-status-updated', {
          miembroId,
          status,
          timestamp: new Date().toISOString()
        });
        
        socket.emit('status-update-success', {
          message: 'Estado actualizado correctamente',
          miembro: {
            id: updatedUser._id,
            nombre: updatedUser.nombre,
            email: updatedUser.email,
            estadoEquipoPedagogico: updatedUser.estadoEquipoPedagogico
          }
        });
      } catch (error) {
        console.error('Error al actualizar estado del miembro:', error);
        socket.emit('error', { message: error.message || 'Error al actualizar estado' });
      }
    });
  });
};