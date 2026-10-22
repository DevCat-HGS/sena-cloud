# Guía de Instalación de SenaCloud en Debian 12

Esta guía proporciona los pasos necesarios para implementar SenaCloud en un sistema Debian 12.

## Requisitos Previos

- Sistema operativo: Debian 12 (Bookworm)
- Acceso root o usuario con privilegios sudo
- Conexión a Internet

## 1. Actualizar el Sistema

Primero, actualiza los repositorios e instala las actualizaciones disponibles:

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Instalar Dependencias del Sistema

Instala las herramientas básicas necesarias:

```bash
sudo apt install -y curl wget git build-essential apt-transport-https ca-certificates gnupg lsb-release
```

## 3. Instalar Node.js y npm

SenaCloud requiere Node.js. Instala la versión 18.x LTS:

```bash
# Añadir repositorio de NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js y npm
sudo apt install -y nodejs

# Verificar la instalación
node --version
npm --version
```

## 4. Instalar y Configurar MongoDB

La aplicación utiliza MongoDB como base de datos:

```bash
# Importar la clave pública de MongoDB
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Añadir el repositorio de MongoDB
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] http://repo.mongodb.org/apt/debian $(lsb_release -cs)/mongodb-org/6.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Actualizar e instalar MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Iniciar y habilitar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar el estado de MongoDB
sudo systemctl status mongod
```

## 5. Clonar el Repositorio de SenaCloud

```bash
# Clonar el repositorio (reemplaza con la URL correcta de tu repositorio)
git clone https://github.com/tu-usuario/SenaCloud.git
cd SenaCloud
```

## 6. Configurar el Backend (API)

```bash
# Navegar al directorio de la API
cd API

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar el archivo .env con la configuración adecuada
nano .env
```

Configura las siguientes variables en el archivo `.env`:

```
PORT=3001
MONGO_URI=mongodb://localhost:27017/senacloud
JWT_SECRET=tu_clave_secreta_muy_segura
EMAIL_USER=tu_email@ejemplo.com
EMAIL_PASS=tu_contraseña_de_email
EMAIL_HOST=smtp.ejemplo.com
EMAIL_PORT=587
```

## 7. Configurar el Frontend

```bash
# Volver al directorio principal
cd ..

# Instalar dependencias del frontend
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar el archivo .env
nano .env
```

Configura las siguientes variables en el archivo `.env` del frontend:

```
VITE_API_URL=http://localhost:3001
```

## 8. Método 1: Iniciar la Aplicación Directamente

### Iniciar el Backend

```bash
# Navegar al directorio de la API
cd API

# Iniciar el servidor en modo desarrollo
npm run dev

# O iniciar en modo producción
npm start
```

### Iniciar el Frontend

En una nueva terminal:

```bash
# Navegar al directorio principal
cd /ruta/a/SenaCloud

# Iniciar el frontend en modo desarrollo
npm run dev

# O construir para producción
npm run build

# Servir la versión de producción
npm install -g serve
serve -s dist
```

## 9. Método 2: Implementación con Docker (Opcional)

Si prefieres usar Docker:

### Instalar Docker y Docker Compose

```bash
# Instalar Docker
sudo apt install -y docker.io

# Añadir tu usuario al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios de grupo (o reiniciar la sesión)
newgrp docker

# Instalar Docker Compose
sudo apt install -y docker-compose
```

### Iniciar con Docker Compose

```bash
# Navegar al directorio del proyecto
cd /ruta/a/SenaCloud

# Iniciar los contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 10. Acceder a la Aplicación

- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173 (en desarrollo) o http://localhost:3000 (con serve)
- **Con Docker**: http://localhost:80

## Solución de Problemas Comunes

### Error de conexión a MongoDB
Verifica que MongoDB esté en ejecución:
```bash
sudo systemctl status mongod
```

### Puertos en uso
Si los puertos están en uso, puedes cambiarlos en los archivos de configuración o detener los servicios que los utilizan.

### Problemas de permisos
Asegúrate de que los directorios tengan los permisos correctos:
```bash
sudo chown -R $USER:$USER /ruta/a/SenaCloud
```

## Mantenimiento

### Actualizar la aplicación
```bash
# Navegar al directorio del proyecto
cd /ruta/a/SenaCloud

# Obtener los últimos cambios
git pull

# Actualizar dependencias
npm install
cd API
npm install
```

### Respaldo de la base de datos
```bash
# Crear un respaldo de la base de datos
mongodump --db senacloud --out /ruta/al/respaldo
```

---

Para más información, consulta la documentación oficial en los archivos README.md del proyecto.