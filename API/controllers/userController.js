const User = require('../models/User');
// Eliminamos la referencia a Socket.IO
// const io = require('../sockets/io');

// Obtener usuarios por roles
exports.getUsersByRoles = async (req, res) => {
  try {
    const { roles } = req.query;
    
    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ message: 'Se requiere un array de roles' });
    }
    
    // Mapear los nombres de roles de la URL a los valores almacenados en la base de datos
    const roleMapping = {
      'equipo-pedagogico': 'EquipoPedagogico',
      'instructor': 'Instructor',
      'coordinador': 'Coordinador',
      'admin': 'Admin'
    };
    
    // Convertir los roles de la URL a los valores de la base de datos
    const dbRoles = roles.map(role => roleMapping[role] || role);
    
    const users = await User.find({ 
      rol: { $in: dbRoles },
      // Solo usuarios activos
      estado: 'activo'
    }).select('_id name email rol');
    
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios por roles:', error);
    res.status(500).json({ message: error.message });
  }
};

// Promover instructor a equipo pedagógico
exports.promoteToEquipoPedagogico = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que el usuario sea un instructor
    if (user.rol !== 'Instructor') {
      return res.status(400).json({ message: 'El usuario no es un instructor' });
    }
    
    // Cambiar el rol a equipo pedagógico
    user.rol = 'EquipoPedagogico';
    await user.save();
    
    res.json({ 
      message: 'Instructor promovido a equipo pedagógico exitosamente', 
      user 
    });
  } catch (error) {
    console.error('Error al promover instructor:', error);
    res.status(400).json({ message: error.message });
  }
};

// Degradar de equipo pedagógico a instructor
exports.degradeToInstructor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que el usuario sea del equipo pedagógico
    if (user.rol !== 'EquipoPedagogico') {
      return res.status(400).json({ message: 'El usuario no es miembro del equipo pedagógico' });
    }
    
    // Cambiar el rol a instructor y establecer estado como aprobado
    user.rol = 'Instructor';
    user.estadoInstructor = 'aprobado';
    await user.save();
    
    res.json({ 
      message: 'Miembro degradado a instructor exitosamente', 
      user 
    });
  } catch (error) {
    console.error('Error al degradar miembro del equipo pedagógico:', error);
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    // Filtrar por rol si se proporciona en la consulta
    const filter = {};
    if (req.query.rol) {
      filter.rol = req.query.rol;
    }
    
    const users = await User.find(filter);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un usuario específico
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    // Ya no emitimos eventos de Socket.IO
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Si se están actualizando etiquetas, reemplazar completamente el array
    if (req.body.etiquetas) {
      user.etiquetas = req.body.etiquetas;
      delete req.body.etiquetas;
    }
    
    // Actualizar el resto de campos
    Object.assign(user, req.body);
    await user.save();
    
    // Ya no emitimos eventos de Socket.IO
    
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar estado de instructor
exports.updateInstructorStatus = async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const User = require('../models/User');
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.rol !== 'Instructor') {
      return res.status(400).json({ message: 'El usuario no es un instructor' });
    }
    
    if (!['pendiente', 'aprobado', 'rechazado'].includes(req.body.estadoInstructor)) {
      return res.status(400).json({ message: 'Estado inválido. Debe ser "pendiente", "aprobado" o "rechazado"' });
    }
    
    const estadoAnterior = user.estadoInstructor;
    user.estadoInstructor = req.body.estadoInstructor;
    await user.save();
    
    // Enviar notificación por correo si el instructor fue aprobado
    if (estadoAnterior !== 'aprobado' && user.estadoInstructor === 'aprobado') {
      try {
        await emailService.notifyInstructorApproval(user);
        console.log(`Correo de aprobación enviado a ${user.correoInstitucional || user.correoPersonal}`);
      } catch (emailError) {
        console.error('Error al enviar correo de aprobación:', emailError);
        // No interrumpimos el flujo si falla el envío de correo
      }
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar estado de instructor:', error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar estado de coordinador
exports.updateCoordinadorStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.rol !== 'Coordinacion') {
      return res.status(400).json({ message: 'El usuario no es un coordinador' });
    }
    
    if (!['pendiente', 'aprobado', 'rechazado'].includes(req.body.estadoCoordinador)) {
      return res.status(400).json({ message: 'Estado inválido. Debe ser "pendiente", "aprobado" o "rechazado"' });
    }
    
    user.estadoCoordinador = req.body.estadoCoordinador;
    await user.save();
    
    // Ya no emitimos eventos de Socket.IO
    
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar estado de coordinador:', error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar estado de equipo pedagógico
exports.updateEquipoPedagogicoStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.rol !== 'EquipoPedagogico') {
      return res.status(400).json({ message: 'El usuario no es un miembro del equipo pedagógico' });
    }
    
    if (!['pendiente', 'aprobado', 'rechazado'].includes(req.body.estadoEquipoPedagogico)) {
      return res.status(400).json({ message: 'Estado inválido. Debe ser "pendiente", "aprobado" o "rechazado"' });
    }
    
    user.estadoEquipoPedagogico = req.body.estadoEquipoPedagogico;
    await user.save();
    
    // Ya no emitimos eventos de Socket.IO
    
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar estado de miembro del equipo pedagógico:', error);
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Usar findByIdAndDelete en lugar de remove() que está obsoleto
    await User.findByIdAndDelete(req.params.id);
    
    // Ya no emitimos eventos de Socket.IO
    
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: error.message });
  }
};