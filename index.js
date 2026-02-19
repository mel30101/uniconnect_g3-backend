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
    callbackURL: "https://lauran-plucky-shanae.ngrok-free.dev/auth/google/callback",
    proxy: true // <--- AGREGA ESTA LÍNEA
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Aquí buscamos o creamos al usuario en Firestore
      const userRef = db.collection('users').doc(profile.id);
      const doc = await userRef.get();

      const userData = {
        uid: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
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

// Rutas de Autenticación
app.get('/auth/google', (req, res, next) => {
  // Guardamos la URL de redirección que nos mande Expo (la de la docente)
  const returnTo = req.query.redirect;
  // 2. Ejecutamos la autenticación pidiendo los permisos (SCOPE) necesarios
  passport.authenticate('google', { 
    scope: ['profile', 'email'], // <--- ESTO ES LO QUE FALTA
    state: returnTo,
    accessType: 'offline', // Opcional: para obtener un refresh token
    prompt: 'select_account' // Opcional: obliga a elegir cuenta siempre
  })(req, res, next);
});

app.get('/auth/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const expoUrl = req.query.state || "exp://localhost:8081"; // Fallback por seguridad
    // Redirigimos de vuelta a Expo Go con los datos del usuario
    res.redirect(`${expoUrl}?name=${encodeURIComponent(req.user.name)}&email=${req.user.email}`);
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
