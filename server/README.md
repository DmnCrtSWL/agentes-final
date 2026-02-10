# Server - API de Citas Médicas

Backend centralizado para el sistema de citas médicas del Dr. Quiroz.

## 🚀 Características

- **API REST** para gestión de citas médicas
- **Notificaciones por email** (confirmaciones y recordatorios)
- **Base de datos PostgreSQL** (Neon)
- **Cron jobs** para procesamiento automático de correos
- **CORS** configurado para frontends (chat y admin)

## 📁 Estructura del Proyecto

```
server/
├── config/
│   └── database.js          # Configuración de PostgreSQL
├── routes/
│   ├── appointments.js      # Rutas de citas
│   └── cron.js             # Rutas de cron y debug
├── services/
│   └── email.js            # Servicio de correos
├── migrations/
│   └── 001_initial_schema.sql
├── index.js                # Punto de entrada
├── package.json
└── .env.example
```

## 🔧 Instalación

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**

   Copia `.env.example` a `.env` y configura:

   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   EMAIL_USER=tu-email@dominio.com
   EMAIL_PASS=tu-contraseña
   FRONTEND_URL=http://localhost:5173
   PORT=3000
   ```

3. **Ejecutar migraciones:**

   Conecta a tu base de datos y ejecuta:

   ```bash
   psql $DATABASE_URL -f migrations/001_initial_schema.sql
   ```

## 🏃 Ejecución

**Modo desarrollo:**

```bash
npm run dev
```

**Modo producción:**

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 Endpoints

### Citas

- `GET /api/citas` - Obtener citas activas
- `GET /api/cancelaciones` - Obtener citas canceladas
- `POST /api/citas` - Crear nueva cita
- `PUT /api/citas/:id/status` - Actualizar estado de cita

### Cron Jobs

- `GET /api/cron/process-emails` - Procesar correos pendientes
- `GET /api/debug/email?to=email@example.com` - Probar configuración de email

### Información

- `GET /` - Información de la API
- `GET /api` - Estado del servidor

## 📧 Sistema de Emails

El servidor envía automáticamente:

1. **Confirmación** - Al crear una cita
2. **Recordatorio** - 48 horas antes de la cita

Los correos se procesan cada 10 minutos mediante un cron job interno.

## 🗄️ Base de Datos

Tabla `citas`:

- `id` - ID único
- `paciente_nombre` - Nombre del paciente
- `telefono` - Teléfono de contacto
- `email` - Email de contacto
- `fecha_hora` - Fecha y hora de la cita
- `motivo` - Motivo de la consulta
- `status` - Estado (confirmada, cancelada, completada)
- `email_sent` - Flag de email de confirmación enviado
- `reminder_sent` - Flag de recordatorio enviado
- `deleted_at` - Fecha de cancelación (soft delete)
- `created_at` - Fecha de creación

## 🔐 Seguridad

- SSL habilitado para conexiones a base de datos
- CORS configurado para dominios específicos
- Variables de entorno para credenciales sensibles

## 🛠️ Tecnologías

- **Node.js** + **Express** - Framework web
- **PostgreSQL** (pg) - Base de datos
- **Nodemailer** - Envío de correos (IONOS SMTP)
- **dotenv** - Variables de entorno
- **CORS** - Cross-Origin Resource Sharing
