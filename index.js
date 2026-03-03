require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const passport = require('passport');
require('./config/passport'); // Configuración de Passport
const { globalErrorHandler } = require('./middlewares/errorMiddleware');

// Inicializar Firebase (Solo una vez aquí)
const serviceAccount = require('./config/serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const app = express();
app.use(cors());
app.use(express.json());

// Importar y usar rutas
app.use('/api/academic-profile', require('./routes/profileRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/chats', require('./routes/chatRoutes'));

app.use('/api/careers', require('./routes/careerRoutes')); 
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/career-structure', require('./routes/sectionRoutes'));
app.use('/api/search-students', require('./routes/searchRoutes'));

// Middleware de error al FINAL (Obligatorio)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));