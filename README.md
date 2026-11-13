# TaskFlow JWT – Aplicación Full Stack (Práctica 4)

Aplicación web **Full Stack** desarrollada con **React**, **Node.js**, **Express**, **MongoDB Atlas** y autenticación con **JWT (JSON Web Tokens)** para gestionar tareas personales con control de acceso y reportería en tiempo real.

---

## Tecnologías utilizadas

- **Front-End:** React 18, Vite, React Router DOM, Axios, Lucide React
- **Back-End:** Node.js, Express, Mongoose, JSON Web Token (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`
- **Base de datos:** MongoDB Atlas (NoSQL)

---

## Funcionalidades implementadas

### Sesión 1 – MongoDB y Back-End
- Conexión a **MongoDB Atlas** mediante Mongoose (`backend/src/config/db.js`).
- Modelos NoSQL: `User` (`backend/src/models/User.js`) y `Task` (`backend/src/models/Task.js`).
- Endpoints REST para registro y consulta de datos.

### Sesión 2 – Autenticación con JWT
- Registro (`POST /api/auth/register`) e inicio de sesión (`POST /api/auth/login`).
- Encriptación segura de contraseñas con `bcryptjs` (las contraseñas nunca se devuelven en las respuestas JSON).
- Generación y validación de tokens **JWT** mediante el middleware `protect` (`backend/src/middlewares/authMiddleware.js`).
- Rutas protegidas: perfil de usuario, listado seguro de usuarios y CRUD completo de tareas por usuario.

### Sesión 3 – Integración Full Stack
- Front-End en **React** conectado a la API REST.
- Flujo completo de registro, inicio de sesión, cierre de sesión y protección de rutas (`ProtectedRoute`).
- **CRUD transaccional y reportería:** creación, consulta con filtros/búsqueda, edición, cambio rápido de estado, eliminación y tarjetas de métricas/progreso.
- **Laboratorio de Pruebas JWT (`/pruebas-jwt`):** interfaz interactiva para comprobar en vivo respuestas `401 Unauthorized` (sin token / token inválido) frente a `200 OK` (con token JWT válido).

---

## Estructura del proyecto

```text
practica_ultima/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── components/
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
├── .gitignore
└── README.md
```

---

## Endpoints principales de la API

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Público | Verifica que la API esté activa |
| `POST` | `/api/auth/register` | Público | Registra un usuario y retorna JWT |
| `POST` | `/api/auth/login` | Público | Autentica usuario y retorna JWT |
| `GET` | `/api/auth/profile` | Protegido (JWT) | Obtiene el perfil del usuario autenticado |
| `GET` | `/api/auth/users` | Protegido (JWT) | Lista usuarios registrados (sin contraseñas) |
| `GET` | `/api/tasks` | Protegido (JWT) | Lista tareas con filtros y resumen estadístico |
| `POST` | `/api/tasks` | Protegido (JWT) | Crea una nueva tarea |
| `PUT` | `/api/tasks/:id` | Protegido (JWT) | Actualiza una tarea existente |
| `DELETE` | `/api/tasks/:id` | Protegido (JWT) | Elimina una tarea |

---

## Configurar MongoDB Atlas (Base de Datos Online)

Para ejecutar el proyecto sin instalar MongoDB localmente, conecta una base de datos gratuita en la nube con **MongoDB Atlas**:

1. **Crear cuenta y clúster:**
   - Ingresa a [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) e inicia sesión.
   - Crea un clúster gratuito (**Free / M0**, por ejemplo `Cluster0`). No es necesario marcar *Load a sample dataset*.

2. **Crear usuario de base de datos:**
   - En el menú izquierdo ve a **Security → Database & Network Access → Database Users** (o usa el asistente inicial al crear el clúster).
   - Crea un usuario y contraseña (anótalos y evita caracteres especiales como `@`, `#` o `/` en la contraseña).

3. **Habilitar acceso de red:**
   - En **Database & Network Access → IP Access List**, haz clic en **Add IP Address**.
   - Selecciona **Allow Access from Anywhere** (`0.0.0.0/0`) y confirma. Esto permite conectarse desde tu equipo, el de tus compañeros y servidores en la nube.

4. **Obtener la cadena de conexión (`MONGO_URI`):**
   - Ve a **Clusters → Connect → Drivers and Client Libraries**.
   - Selecciona **Language: JavaScript** y **Client Library: Node.js Driver**.
   - Copia la cadena de conexión que inicia con `mongodb+srv://...` y reemplaza `<db_username>` y `<db_password>` por tus credenciales, agregando el nombre de la base de datos antes del `?`, por ejemplo:
     ```env
     MONGO_URI=mongodb+srv://tu_usuario:tu_password@cluster0.xxxxxx.mongodb.net/taskflow_practica4?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Pega esa línea dentro de `backend/.env` (sin subir nunca el archivo `.env` a GitHub).

---

## Archivos `.env` requeridos

Por seguridad, los archivos `.env` están excluidos en `.gitignore` y **no se suben a GitHub**. Al clonar el repositorio, cada integrante debe crear **2 archivos**:

### 1. `backend/.env` (obligatorio)
Créalo copiando `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```
Contenido requerido en `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster0.xxxxxx.mongodb.net/taskflow_practica4?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=clave_secreta_larga_y_segura
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
- `PORT`: puerto del servidor Express (`5000`).
- `MONGO_URI`: cadena de conexión de **MongoDB Atlas**.
- `JWT_SECRET`: clave secreta para firmar y validar los tokens JWT (puede ser cualquier texto largo).
- `JWT_EXPIRES_IN`: tiempo de expiración del token (`7d` = 7 días).
- `CLIENT_URL`: URL del Front-End permitida por CORS (`http://localhost:5173` en local).

### 2. `frontend/.env` (obligatorio)
Créalo copiando `frontend/.env.example`:
```bash
cp frontend/.env.example frontend/.env
```
Contenido requerido en `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
- `VITE_API_URL`: URL base de la API del Back-End (`http://localhost:5000/api` en local).

> **¿Qué pasarle a tus compañeros del grupo?**  
> Como GitHub no incluye los `.env`, envíales por privado (WhatsApp/Discord) el contenido del archivo **`backend/.env`** (donde ya viene tu `MONGO_URI` de Atlas) y diles que en **`frontend/.env`** solo pongan `VITE_API_URL=http://localhost:5000/api`. Con eso no tendrán que crear otra cuenta en MongoDB Atlas.

---

## Instalación y ejecución local

### 1. Configurar el Back-End
```bash
cd backend
npm install
cp .env.example .env
```
Edita `backend/.env` con tu cadena de MongoDB Atlas (`MONGO_URI`) y ejecuta:
```bash
npm run dev
```
El servidor quedará corriendo en `http://localhost:5000`.

### 2. Configurar el Front-End
En otra terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
La aplicación web quedará disponible en `http://localhost:5173`.

---

## Guía rápida de Deploy (opcional)

1. **Back-End (Render):**
   - Crea un *Web Service* apuntando a la carpeta `backend`.
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Variables de entorno: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `CLIENT_URL=https://tu-frontend.vercel.app`
2. **Front-End (Vercel):**
   - Importa el repositorio seleccionando la carpeta `frontend` (Framework: Vite).
   - Variable de entorno: `VITE_API_URL=https://tu-backend.onrender.com/api`
