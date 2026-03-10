require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const passport = require('passport');
require('./config/passport'); // Configuración de Passport
const { globalErrorHandler } = require('./middlewares/errorMiddleware');

// Inicializar Firebase (Solo una vez aquí)
const serviceAccount = require('./config/serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const app = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// --- DEFINICIÓN DE RUTAS ---

// Rutas de Autenticación
app.use('/auth', require('./routes/authRoutes'));

// Rutas de la API (Prefijo /api)
app.use('/api/academic-profile', require('./routes/profileRoutes'));
app.use('/api/chat', require('./routes/chatRoutes')); // Centralizamos aquí
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/career-structure', require('./routes/sectionRoutes'));
app.use('/api/search-students', require('./routes/searchRoutes'));
app.use('/api/hierarchy', require('./routes/hierarchyRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));

// --- MANEJO DE ERRORES ---
// Middleware de error al FINAL (Obligatorio)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor UniConnect listo en puerto ${PORT}`));