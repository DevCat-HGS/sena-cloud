const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// Middleware para verificar roles
exports.checkRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Acceso denegado. Usuario no autenticado.' });
    }
    
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado. No tienes permisos suficientes.' });
    }
    
    next();
  };
};