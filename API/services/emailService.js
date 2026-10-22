const nodemailer = require('nodemailer');

// Crear transporter con la configuración del archivo .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Envía un correo electrónico
 * @param {Object} options - Opciones del correo
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto
 * @param {string} options.text - Texto plano
 * @param {string} options.html - HTML (opcional)
 * @returns {Promise} - Promesa con el resultado del envío
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"SenaCloud" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
};

/**
 * Envía notificación a administradores sobre un nuevo instructor pendiente
 * @param {Object} instructor - Datos del instructor
 * @param {Array} adminEmails - Correos de los administradores (opcional)
 */
const notifyAdminsAboutPendingInstructor = async (instructor, adminEmails = null) => {
  const subject = 'Nuevo instructor pendiente de aprobación';
  const text = `
    Un nuevo instructor se ha registrado y está pendiente de aprobación:
    
    Nombre: ${instructor.nombre}
    Correo institucional: ${instructor.correoInstitucional || 'No disponible'}
    Correo personal: ${instructor.correoPersonal || 'No disponible'}
    
    Por favor, revise y apruebe o rechace esta solicitud en el panel de administración.
  `;

  // Si no se proporcionan correos específicos, usar correos predeterminados para roles administrativos
  if (!adminEmails || !Array.isArray(adminEmails) || adminEmails.length === 0) {
    // Importar el modelo de usuario si es necesario
    const User = require('../models/User');
    
    try {
      // Buscar usuarios con roles administrativos
      const admins = await User.find({
        rol: { $in: ['Admin', 'SuperAdmin', 'Coordinacion'] }
      }).select('correoInstitucional correoPersonal');
      
      // Crear lista de correos (preferir correo institucional)
      adminEmails = admins.map(admin => admin.correoInstitucional || admin.correoPersonal).filter(Boolean);
    } catch (error) {
      console.error('Error al buscar administradores:', error);
      // Si hay error, usar un correo predeterminado del .env
      adminEmails = [process.env.EMAIL_USER];
    }
  }

  // Enviar a cada administrador
  for (const email of adminEmails) {
    try {
      await sendEmail({
        to: email,
        subject,
        text
      });
    } catch (error) {
      console.error(`Error al enviar correo a ${email}:`, error);
    }
  }
};

/**
 * Notifica a un instructor que ha sido aprobado
 * @param {Object} instructor - Datos del instructor
 */
const notifyInstructorApproval = async (instructor) => {
  // Determinar a qué correo enviar (preferiblemente personal para instructores pendientes)
  const email = instructor.correoPersonal || instructor.correoInstitucional;
  
  const subject = 'Tu cuenta de instructor ha sido aprobada';
  const text = `
    Hola ${instructor.nombre},
    
    Nos complace informarte que tu cuenta de instructor en SenaCloud ha sido aprobada.
    Ya puedes acceder a todas las funcionalidades de la plataforma.
    
    Inicia sesión en: http://senacloud.com/login
    
    Saludos,
    El equipo de SenaCloud
  `;

  await sendEmail({
    to: email,
    subject,
    text
  });
};

/**
 * Genera y envía un código de verificación para recuperación de contraseña
 * @param {Object} user - Datos del usuario
 * @param {string} code - Código de verificación generado
 * @returns {Promise<boolean>} - Indica si el correo fue enviado exitosamente
 */
const sendPasswordResetCode = async (user, code) => {
  // Determinar a qué correo enviar (usar el correo proporcionado por el usuario)
  const email = user.correoPersonal || user.correoInstitucional;
  
  if (!email) {
    console.error('No se encontró un correo válido para el usuario');
    return false;
  }
  
  const subject = 'Código de recuperación de contraseña - SenaCloud';
  const text = `
    Hola ${user.nombre},
    
    Has solicitado restablecer tu contraseña en SenaCloud.
    
    Tu código de verificación es: ${code}
    
    Este código expirará en 15 minutos.
    
    Si no solicitaste este cambio, puedes ignorar este correo.
    
    Saludos,
    El equipo de SenaCloud
  `;
  
  try {
    await sendEmail({
      to: email,
      subject,
      text
    });
    console.log(`Código de recuperación enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('Error al enviar código de recuperación:', error);
    return false;
  }
};

/**
 * Notifica al usuario que su contraseña ha sido cambiada exitosamente
 * @param {Object} user - Datos del usuario
 * @returns {Promise<boolean>} - Indica si el correo fue enviado exitosamente
 */
const notifyPasswordChanged = async (user) => {
  // Determinar a qué correo enviar
  const email = user.correoPersonal || user.correoInstitucional;
  
  if (!email) {
    console.error('No se encontró un correo válido para el usuario');
    return false;
  }
  
  const subject = 'Contraseña actualizada - SenaCloud';
  const text = `
    Hola ${user.nombre},
    
    Tu contraseña de SenaCloud ha sido actualizada exitosamente.
    
    Si no realizaste este cambio, por favor contacta inmediatamente con soporte.
    
    Saludos,
    El equipo de SenaCloud
  `;
  
  try {
    await sendEmail({
      to: email,
      subject,
      text
    });
    console.log(`Notificación de cambio de contraseña enviada a: ${email}`);
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de cambio de contraseña:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  notifyAdminsAboutPendingInstructor,
  notifyInstructorApproval,
  sendPasswordResetCode,
  notifyPasswordChanged
};