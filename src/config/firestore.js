const admin = require('firebase-admin');

// Inicializar Firebase si aún no ha sido inicializado
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    try {
      privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
    } catch (e) {
      console.error('ERROR: Failed to decode FIREBASE_PRIVATE_KEY_BASE64');
    }
  }

  if (!projectId || !privateKey || !clientEmail) {
    console.error('ERROR: Missing Firebase environment variables:', {
      projectId: !!projectId,
      privateKey: !!privateKey,
      clientEmail: !!clientEmail
    });
  }

  // Limpiar la llave de posibles comillas y manejar saltos de línea (si viene de texto plano)
  const formattedKey = privateKey?.trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n');
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: formattedKey,
      clientEmail,
    }),
  });


}

const db = admin.firestore();

module.exports = { db };


