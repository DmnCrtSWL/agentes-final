import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appointmentsRouter from './routes/appointments.js';
import quotesRouter from './routes/quotes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173', 
  'https://agentes-final-administrador.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Citas Médicas - Dr. Quiroz 🚀',
        version: '1.0.0',
        endpoints: {
            appointments: '/api/citas',
            cancelations: '/api/cancelaciones',
            quotes: '/api/cotizaciones'
        }
    });
});

app.get('/api', (req, res) => {
    res.send('API de Citas Médicas Funcionando 🚀');
});

// API Routes
app.use('/api', appointmentsRouter);
app.use('/api', quotesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 API disponible en http://localhost:${PORT}/api\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    process.exit(0);
});

export default app;
