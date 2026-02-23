require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// Inicializar Firebase Admin
const serviceAccount = require('./config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configuración de Passport (Estrategia de Google)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // En tu backend (index.js)
    callbackURL:`${process.env.BASE_URL}/auth/google/callback`,
    proxy: true 
  },
  async (accessToken, refreshToken, profile, done) => {
    try {

      const email = profile.emails[0].value;

      // VALIDACIÓN DE DOMINIO
      if (!email.endsWith('@ucaldas.edu.co')) {
        // Si el correo no es de la universidad, devolvemos un error
        return done(null, false, { message: 'Solo se permiten correos de @ucaldas.edu.co' });
      }
      // Aquí buscamos o creamos al usuario en Firestore
      const userRef = db.collection('users').doc(profile.id);
      const doc = await userRef.get();

      const userData = {
        uid: profile.id,
        name: profile.displayName,
        email: email,
        photo: profile.photos[0].value,
        lastLogin: new Date()
      };

      if (!doc.exists) {
        await userRef.set(userData);
      } else {
        await userRef.update({ lastLogin: new Date() });
      }

      return done(null, userData);
    } catch (error) {
      return done(error, null);
    }
  }
));

let tempExpoUrl = "";
// Rutas de Autenticación
app.get('/auth/google', (req, res, next) => {
  // Guardamos la URL de redirección que nos mande Expo (la de la docente)
  tempExpoUrl = req.query.redirect;
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    state: tempExpoUrl, // Google nos devolverá esto en el callback
    prompt: 'select_account' 
  })(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    // Recuperamos la URL de Expo del parámetro 'state' de la URL de Google
    const expoUrl = req.query.state || tempExpoUrl;

    if (err || !user) {
      // Si el error es de dominio (definido en la estrategia), redirigimos con el error
      return res.redirect(`${expoUrl}?error=domain_not_allowed`);
    }

    // Si todo está bien, redirigimos con los datos
    res.redirect(`${expoUrl}?name=${encodeURIComponent(user.name)}&email=${user.email}&uid=${user.uid}`);
  })(req, res, next);
});

// Endpoint para crear o actualizar el Perfil Académico
app.post('/api/academic-profile', async (req, res) => {
  try {
    const { studentId, careerId, subjects, isMonitor } = req.body;

    // Validación básica
    if (!studentId || !subjects) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const profileData = {
      studentId,    // ID de Google que ya guardamos en el login
      careerId,     // ID de la carrera seleccionada
      subjects,     // Array de IDs de materias (ej: ["SIS-59G8F", "SIS-63G8F"])
      isMonitor,    // true o false
      updatedAt: new Date()
    };

    // Guardamos en la colección 'academic_profiles' usando el studentId como ID del documento
    await db.collection('academic_profiles').doc(studentId).set(profileData, { merge: true });

    res.status(200).json({ message: "Perfil académico guardado con éxito" });
  } catch (error) {
    console.error("Error al guardar perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para manejar errores de dominio
app.get('/auth/failure', (req, res) => {
  // Recuperamos la URL de Expo que guardamos en el state si es posible, 
  // o usamos un valor por defecto.
  const expoUrl = req.query.state || "exp://localhost:8081"; 
  
  // Redirigimos a la app con un parámetro de error
  res.redirect(`${expoUrl}?error=domain_not_allowed`);
});

// Endpoint para obtener el pensum completo de una carrera (Secciones y sus Materias)
app.get('/api/career-structure/:careerId', async (req, res) => {
  try {
    const { careerId } = req.params;

    // 1. Obtener todas las secciones de esa carrera
    const sectionsSnapshot = await db.collection('sections')
      .where('careerId', '==', careerId)
      .get();

    if (sectionsSnapshot.empty) {
      return res.status(404).json({ error: "No se encontraron secciones para esta carrera" });
    }

    // 2. Obtener todas las materias de esa carrera
    const subjectsSnapshot = await db.collection('subjects')
      .where('careerId', '==', careerId)
      .get();

    const allSubjects = subjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 3. Organizar los datos: Agrupar materias dentro de sus secciones
    const structure = sectionsSnapshot.docs.map(doc => {
      const sectionData = doc.data();
      const sectionId = doc.id;

      return {
        sectionId: sectionId,
        sectionName: sectionData.name,
        // Filtramos las materias que pertenecen a esta sección
        subjects: allSubjects.filter(sub => sub.sectionId === sectionId)
      };
    });

    res.status(200).json(structure);
  } catch (error) {
    console.error("Error al obtener estructura de carrera:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get('/api/careers', async (req, res) => {
  const snapshot = await db.collection('careers').get();
  const careers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(careers);
});

// Obtener el perfil de un estudiante específico
app.get('/api/academic-profile/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const doc = await db.collection('academic_profiles').doc(studentId).get();

    if (!doc.exists) {
      return res.status(404).json(null); // Importante enviar null o 404
    }

    // Enviamos los datos limpios al frontend
    res.status(200).json(doc.data()); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/search-students', async (req, res) => {
  try {
    const {name, subjectId, isMonitor} = req.query;

    let profileQuery = db.collection('academic_profiles');

    if (subjectId) {
      profileQuery = profileQuery.where('subjects', 'array-contains', subjectId);
    }

    if (isMonitor=='true') {
      profileQuery = profileQuery.where('isMonitor', '==', true);
    }

    const profileSnapshot = await profileQuery.get();

    if (profileQuery.empty) {
      return res.json([]);
    }

    const studentIds = profileSnapshot.docs.map(doc => doc.id); 

    const usersSnapshot = await db.collection('users') 
      .where('uid', 'in', studentIds.slice(0,10))
      .get

    let users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (name) {
      users = users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
    }

    res.json(users);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "error en la búsqueda"});
  }
})


const chatRoutes = require('./routes/chatRoutes');
app.use('/chats', chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
