# SENA Cloud

Plataforma web para la operación académica y administrativa de un centro de formación del SENA: guías, reportes,
eventos, actividades y equipos pedagógicos, con roles de superadministrador, administrador, coordinación,
equipo pedagógico e instructor. La desarrollé durante mi formación en el SENA, con aportes de un compañero.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Socket.IO (cliente) y Cypress para pruebas.
- **Backend (`API/`):** Node.js, Express, MongoDB con Mongoose, JWT, Socket.IO, Nodemailer y Multer.
- **Despliegue:** Docker y Docker Compose; la guía para un servidor Debian está en `guia_instalacion_debian.md`.

## Cómo correrlo en local

```bash
# Backend
cd API
cp .env.example .env        # completa JWT_SECRET, el correo y SEED_PASSWORD
npm install
npm run dev                 # API en http://localhost:3001

# Usuarios de prueba (opcional): uno por rol, con la contraseña de SEED_PASSWORD
node scripts/injectUsers.js

# Frontend, en otra terminal, desde la raíz
cp .env.example .env
npm install
npm run dev
```

---

Copia pública del código. Se quitaron las credenciales, los datos del servidor y las contraseñas de los usuarios de
prueba; todo eso va ahora en archivos `.env` que no se suben al repositorio.
