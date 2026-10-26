# Guía de Instalación - Intranet Académica

## Requisitos previos

Estos programas deben estar instalados en tu computadora antes de empezar.

---

### Paso 1: Instalar Node.js

Node.js es el motor que ejecuta el backend (servidor) de la aplicación.

1. Ve a **https://nodejs.org**
2. Descarga la versión **LTS** (la que dice "Recommended")
3. Ejecuta el instalador, dale **Next** a todo
4. Para verificar, abre una terminal (CMD o PowerShell) y escribe:

```
node -v
npm -v
```

Debe mostrar algo como `v20.x.x` y `10.x.x`.

---

### Paso 2: Instalar PostgreSQL

PostgreSQL es la base de datos donde se guardan usuarios, materias, notas, etc.

1. Ve a **https://www.postgresql.org/download/windows/**
2. Click en **"Download the installer"** (te lleva a EDB)
3. Descarga la versión más reciente para **Windows x86-64**
4. Ejecuta el instalador:
   - Deja la carpeta de instalación por defecto
   - **Componentes**: deja todos marcados (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
   - **Contraseña del superusuario**: pon una contraseña que recuerdes, por ejemplo: `postgres123`
     > ⚠️ RECUERDA ESTA CONTRASEÑA, la necesitarás después
   - **Puerto**: déjalo en `5432` (es el default)
   - **Locale**: déjalo como está
   - Click en **Next** hasta que termine la instalación
5. Al finalizar, **desmarca** "Launch Stack Builder" y dale Finish

#### Verificar que PostgreSQL funciona:

1. Abre una terminal (CMD) y escribe:

```
psql -U postgres
```

2. Te pedirá la contraseña que pusiste en la instalación
3. Si entras y ves `postgres=#` está funcionando. Escribe `\q` para salir.

> Si dice "psql no se reconoce", necesitas agregar PostgreSQL al PATH:
> - Busca "Variables de entorno" en Windows
> - En "Path" del sistema, agrega: `C:\Program Files\PostgreSQL\17\bin` (ajusta el 17 al número de tu versión)
> - Cierra y vuelve a abrir la terminal

---

### Paso 3: Crear la base de datos

Abre una terminal y ejecuta:

```
psql -U postgres
```

Ingresa tu contraseña y luego escribe:

```sql
CREATE DATABASE intranet_academica;
```

Debería decir `CREATE DATABASE`. Luego escribe `\q` para salir.

---

### Paso 4: Instalar dependencias del proyecto

Abre una terminal en la carpeta del proyecto y ejecuta:

```
cd "C:\Users\rodol\Downloads\claude video\intranet-academica"
```

Instalar dependencias del **backend**:

```
cd backend
npm install
```

Instalar dependencias del **frontend**:

```
cd ..\frontend
npm install
```

---

### Paso 5: Configurar la conexión a la base de datos

El backend por defecto se conecta a:
```
postgresql://localhost:5432/intranet_academica
```

Si tu contraseña de PostgreSQL NO es la vacía (lo más probable), necesitas indicarla.

Crea un archivo `.env` dentro de la carpeta `backend`:

```
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@localhost:5432/intranet_academica
```

Reemplaza `TU_CONTRASEÑA` con la que pusiste al instalar PostgreSQL (ejemplo: `postgres123`).

> ⚠️ Si tu contraseña tiene caracteres especiales (@, #, etc.), ponlos tal cual.

---

### Paso 6: Iniciar la aplicación

**Opción A - Doble click (fácil):**

Haz doble click en el archivo `INICIAR.bat` que está en la carpeta del proyecto. Se abrirán dos ventanas de terminal:
- Una para el backend (puerto 3001)
- Una para el frontend (puerto 3000)

**Opción B - Manual desde terminal:**

Terminal 1 (Backend):
```
cd "C:\Users\rodol\Downloads\claude video\intranet-academica\backend"
node server.js
```

Terminal 2 (Frontend):
```
cd "C:\Users\rodol\Downloads\claude video\intranet-academica\frontend"
npm start
```

---

### Paso 7: Abrir la aplicación

Abre tu navegador y ve a:

```
http://localhost:3000
```

#### Cuenta de administrador (se crea automáticamente):
- **Email:** admin@intranet.edu
- **Contraseña:** admin123

Desde el admin puedes crear materias, profesores y gestionar todo el sistema.

---

## Uso del sistema

### Roles de usuario:

| Rol | Qué puede hacer |
|-----|-----------------|
| **Admin** | Crear materias, crear usuarios, gestionar notas, ver todo |
| **Profesor** | Ver sus materias, registrar notas de sus alumnos |
| **Alumno** | Inscribirse en materias, ver horario, ver sus notas |

### Flujo de trabajo recomendado:

1. **Admin** entra y crea las materias (nombre, código, horario, aula, cupo)
2. **Admin** crea las cuentas de profesores
3. **Admin** asigna profesores a las materias
4. Los **alumnos** se registran por su cuenta desde la pantalla de login
5. Los **alumnos** se inscriben en las materias que necesitan
6. Los **profesores** entran y registran notas de sus alumnos

---

## Subir a Internet (Oracle Cloud Free Tier)

Oracle Cloud ofrece **2 servidores gratis PARA SIEMPRE** (no es trial, no expira). Suficiente para 100+ alumnos 24/7.

---

### Paso A: Crear cuenta en Oracle Cloud

1. Ve a **https://www.oracle.com/cloud/free/**
2. Click en **"Start for free"**
3. Llena tus datos (necesitas tarjeta de débito/crédito para verificar, pero **NO te cobran**)
4. Selecciona tu **región más cercana** (ej: Sao Paulo para Bolivia)
5. Espera a que se active tu cuenta (puede tardar unas horas)

---

### Paso B: Crear el servidor (VM)

1. Entra a **https://cloud.oracle.com** con tu cuenta
2. Ve a **Compute** → **Instances** → **Create Instance**
3. Configuración:
   - **Name**: `intranet-academica`
   - **Image**: Ubuntu 22.04 (o la versión más reciente de Ubuntu)
   - **Shape**: **VM.Standard.E2.1.Micro** (este es el GRATIS, 1 CPU, 1GB RAM)
   - **Networking**: deja por defecto (crea VCN automática)
   - **SSH Key**: click en **"Generate a key pair"** y **descarga ambas llaves** (pública y privada). Guárdalas bien, las necesitas para conectarte.
4. Click **Create**
5. Espera ~2 minutos a que el estado cambie a **RUNNING**
6. Copia la **IP pública** que aparece (ej: `132.145.xxx.xxx`)

---

### Paso C: Abrir los puertos

Por defecto Oracle bloquea todo. Necesitas abrir el puerto 80 (HTTP) y 443 (HTTPS):

1. En tu instancia, click en **Subnet** (en la sección de red)
2. Click en la **Security List** → **Add Ingress Rules**
3. Agrega estas reglas:

| Source CIDR | Protocol | Destination Port |
|-------------|----------|-----------------|
| 0.0.0.0/0 | TCP | 80 |
| 0.0.0.0/0 | TCP | 443 |
| 0.0.0.0/0 | TCP | 3001 |

4. Click **Add Ingress Rules**

---

### Paso D: Conectarte al servidor por SSH

Desde tu terminal (CMD o PowerShell):

```
ssh -i "ruta/a/tu/llave-privada.key" ubuntu@TU_IP_PUBLICA
```

Reemplaza `ruta/a/tu/llave-privada.key` con la ruta donde guardaste la llave y `TU_IP_PUBLICA` con la IP de tu servidor.

> Si usas Windows y no funciona SSH, descarga **PuTTY** o usa **Git Bash** que ya tienes instalado.

---

### Paso E: Instalar Node.js y PostgreSQL en el servidor

Una vez conectado por SSH, ejecuta estos comandos uno por uno:

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Verificar
node -v
psql --version
```

---

### Paso F: Configurar PostgreSQL en el servidor

```bash
# Entrar a PostgreSQL
sudo -u postgres psql

# Dentro de psql, ejecutar:
CREATE DATABASE intranet_academica;
CREATE USER intranet_user WITH PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE intranet_academica TO intranet_user;
\q
```

---

### Paso G: Subir tu código al servidor

**Opción 1 - Desde GitHub (recomendado):**

Primero sube tu código a GitHub desde tu PC:
```
cd "C:\Users\rodol\Downloads\claude video\intranet-academica"
git init
git add .
git commit -m "Intranet académica"
```

Crea un repo en GitHub y sube:
```
git remote add origin https://github.com/TU_USUARIO/intranet-academica.git
git push -u origin main
```

Luego en el servidor Oracle (por SSH):
```bash
cd ~
git clone https://github.com/TU_USUARIO/intranet-academica.git
cd intranet-academica
```

**Opción 2 - Compilar frontend antes de subir:**

En tu PC, haz doble click en `DEPLOY.bat` para compilar el frontend. Luego sube todo a GitHub.

---

### Paso H: Instalar dependencias y configurar en el servidor

```bash
cd ~/intranet-academica/backend
npm install

# Crear archivo de configuración
nano .env
```

Escribe esto en el archivo `.env`:
```
DATABASE_URL=postgresql://intranet_user:tu_contraseña_segura@localhost:5432/intranet_academica
PORT=3001
```

Guarda con `Ctrl+O`, Enter, `Ctrl+X`.

---

### Paso I: Compilar frontend en el servidor (si no lo hiciste en tu PC)

```bash
cd ~/intranet-academica/frontend
npm install
npm run build

# Copiar build al backend
cp -r build ../backend/public
```

---

### Paso J: Instalar PM2 (mantiene la app corriendo 24/7)

```bash
sudo npm install -g pm2

cd ~/intranet-academica/backend
pm2 start server.js --name "intranet"

# Hacer que inicie automáticamente cuando se reinicie el servidor
pm2 startup
pm2 save
```

Tu app ahora corre en `http://TU_IP_PUBLICA:3001`

---

### Paso K: Configurar Nginx (para acceder por puerto 80)

```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/intranet
```

Pega esto:
```nginx
server {
    listen 80;
    server_name TU_IP_PUBLICA;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Guarda y activa:
```bash
sudo ln -s /etc/nginx/sites-available/intranet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Ahora tu app está en `http://TU_IP_PUBLICA` (sin necesidad de poner :3001)

---

### Paso L: Conectar dominio gratis (opcional)

1. Registra un dominio gratis en **https://dash.domain.digitalplat.org** (ej: `intranet-academica.dpdns.org`)
2. En la configuración DNS, agrega un registro **A** apuntando a tu IP pública de Oracle
3. Cambia `server_name` en la configuración de Nginx por tu dominio
4. Reinicia Nginx: `sudo systemctl restart nginx`

Tu intranet queda en: `http://intranet-academica.dpdns.org`

---

### Paso M: SSL gratis con Let's Encrypt (opcional, para HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.dpdns.org
```

Sigue las instrucciones. Certbot configura HTTPS automáticamente y renueva el certificado solo.

Tu intranet queda en: `https://tu-dominio.dpdns.org`

---

## Backup y Restauración

### Hacer backup:
```
cd backend
npm run backup
```
Genera un archivo JSON en `backend/backups/` con todos los datos.

### Restaurar backup:
```
cd backend
npm run restore -- backups/nombre-del-archivo.json
```

---

## Solución de problemas

| Error | Solución |
|-------|----------|
| "Failed to fetch" en el navegador | El backend no está corriendo. Verifica que `node server.js` esté activo |
| "psql no se reconoce" | Agrega PostgreSQL al PATH del sistema (ver Paso 2) |
| "Connection refused" al iniciar backend | PostgreSQL no está corriendo. Abre "Servicios" de Windows y busca "postgresql", dale "Iniciar" |
| "password authentication failed" | La contraseña en el archivo `.env` no coincide con la de PostgreSQL |
| "database intranet_academica does not exist" | No creaste la base de datos. Ejecuta el Paso 3 |
| Puerto 3000 o 3001 ocupado | Cierra otras apps que usen esos puertos, o cambia el puerto en el código |

---

## Estructura del proyecto

```
intranet-academica/
├── backend/
│   ├── server.js          (servidor Express)
│   ├── database.js         (conexión PostgreSQL)
│   ├── middleware/auth.js   (autenticación JWT)
│   ├── routes/             (API endpoints)
│   ├── scripts/            (backup y restore)
│   ├── package.json
│   └── Procfile            (para Railway)
├── frontend/
│   ├── src/
│   │   ├── App.js          (componente principal)
│   │   ├── App.css         (estilos dark theme)
│   │   ├── api.js          (llamadas al backend)
│   │   └── pages/          (páginas de la app)
│   └── package.json
├── INICIAR.bat             (arranque rápido local)
├── DEPLOY.bat              (compilar para producción)
└── GUIA-INSTALACION.md     (este archivo)
```
