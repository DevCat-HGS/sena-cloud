const express = require('express');
const router = express.Router();
const User = require('../models/User');
const io = require('../sockets/io');
const { verifyToken, checkRoles } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateInstructorStatus,
  updateCoordinadorStatus,
  updateEquipoPedagogicoStatus,
  promoteToEquipoPedagogico,
  degradeToInstructor,
  getUsersByRoles
} = require('../controllers/userController');

// Rutas de usuarios
router.route('/')
  .get(getUsers)
  .post(createUser);

// Ruta para obtener usuarios por roles
router.get('/roles', verifyToken, getUsersByRoles);

// Ruta para obtener instructores aprobados
router.get('/instructors/approved', verifyToken, async (req, res) => {
  try {
    const instructors = await User.find({ 
      rol: 'Instructor',
      estadoInstructor: 'aprobado'
    }).select('_id name email');
    
    res.json(instructors);
  } catch (error) {
    console.error('Error al obtener instructores aprobados:', error);
    res.status(500).json({ message: error.message });
  }
});

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Ruta para actualizar estado de instructor
router.route('/:id/instructor-status')
  .put(updateInstructorStatus);

// Ruta para actualizar estado de coordinador
router.route('/:id/coordinador-status')
  .put(updateCoordinadorStatus);

// Ruta para actualizar estado de miembro del equipo pedagógico
router.route('/:id/equipopedagogico-status')
  .put(updateEquipoPedagogicoStatus);
  
// Ruta para promover instructor a equipo pedagógico
router.route('/:id/promote-to-equipopedagogico')
  .put(verifyToken, checkRoles(['Admin', 'SuperAdmin', 'Coordinacion']), promoteToEquipoPedagogico);

// Ruta para degradar de equipo pedagógico a instructor
router.route('/:id/degrade-to-instructor')
  .put(verifyToken, checkRoles(['Admin', 'SuperAdmin', 'Coordinacion']), degradeToInstructor);
  
// Ruta para actualizar estado de administrador
router.route('/:id/admin-status')
  .put(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Administrador no encontrado' });
      }
      
      if (user.rol !== 'Administracion') {
        return res.status(400).json({ message: 'El usuario no es un administrador' });
      }
      
      // Actualizar estado
      user.estadoAdministrador = req.body.status;
      await user.save();
      
      // Emitir evento de Socket.IO
      const userNamespace = io.getIO().of('/users');
      userNamespace.emit('admin-status-updated', {
        administradorId: user._id,
        status: user.estadoAdministrador
      });
      
      return res.status(200).json({ 
        message: 'Estado de administrador actualizado correctamente',
        user
      });
    } catch (error) {
      console.error('Error al actualizar estado de administrador:', error);
      return res.status(500).json({ message: error.message });
    }
  });

// Ruta para actualizar etiquetas de usuario
router.route('/:id/etiquetas')
  .put(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Actualizar etiquetas
      user.etiquetas = req.body.etiquetas;
      await user.save();
      
      // Emitir evento de usuario actualizado
      io.of('/users').emit('user-updated', user);
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

module.exports = router;