const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// Almacenamiento temporal de códigos de verificación (en producción usar Redis o similar)
const resetCodes = new Map();

/**
 * Solicita un código de recuperación de contraseña
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }

    // Buscar usuario por correo institucional o personal
    const user = await User.findOne({
      $or: [
        { correoInstitucional: email },
        { correoPersonal: email }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'No se encontró ningún usuario con ese correo electrónico' });
    }

    // Generar código aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Almacenar código con tiempo de expiración (15 minutos)
    resetCodes.set(user._id.toString(), {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutos
    });

    // Enviar correo con código
    const emailSent = await emailService.sendPasswordResetCode(user, code);

    if (!emailSent) {
      return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
    }

    res.status(200).json({ 
      message: 'Se ha enviado un código de verificación a tu correo electrónico',
      userId: user._id
    });
  } catch (error) {
    console.error('Error en solicitud de recuperación de contraseña:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};

/**
 * Verifica el código de recuperación
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const verifyResetCode = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: 'El ID de usuario y el código son requeridos' });
    }

    // Verificar si existe un código para ese usuario
    const resetData = resetCodes.get(userId);
    
    if (!resetData) {
      return res.status(400).json({ message: 'No hay un código de verificación activo para este usuario' });
    }

    // Verificar si el código ha expirado
    if (Date.now() > resetData.expiresAt) {
      resetCodes.delete(userId);
      return res.status(400).json({ message: 'El código de verificación ha expirado' });
    }

    // Verificar si el código es correcto
    if (resetData.code !== code) {
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }

    // Código válido, generar token temporal para cambio de contraseña
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Actualizar datos de reseteo con el token
    resetCodes.set(userId, {
      ...resetData,
      resetToken,
      verified: true
    });

    res.status(200).json({ 
      message: 'Código verificado correctamente',
      resetToken
    });
  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};

/**
 * Cambia la contraseña después de verificar el código
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const resetPassword = async (req, res) => {
  try {
    const { userId, resetToken, newPassword } = req.body;

    if (!userId || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar token de reseteo
    const resetData = resetCodes.get(userId);
    
    if (!resetData || !resetData.verified || resetData.resetToken !== resetToken) {
      return res.status(400).json({ message: 'Token de reseteo inválido' });
    }

    // Verificar si el token ha expirado
    if (Date.now() > resetData.expiresAt) {
      resetCodes.delete(userId);
      return res.status(400).json({ message: 'La sesión de cambio de contraseña ha expirado' });
    }

    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Validar contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Mantenemos bcrypt visible en el código pero no lo usamos para encriptar
    // Esto es solo para propósitos de desarrollo/pruebas
    const salt = await bcrypt.genSalt(10); // Generamos salt pero no lo usamos
    const hashedPassword = await bcrypt.hash(newPassword, salt); // Generamos hash pero no lo usamos
    
    // Guardamos la contraseña en texto plano
    user.password = newPassword;
    await user.save();

    // Eliminar código de verificación
    resetCodes.delete(userId);

    // Enviar correo de confirmación
    await emailService.notifyPasswordChanged(user);

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetCode,
  resetPassword
};