const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    // Configuramos la subida
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'uniconnect_chats', // Creará esta carpeta automáticamente
        resource_type: 'auto',      // 'auto' permite subir imágenes, PDFs, etc.
        public_id: `archivo_${Date.now()}`,
        public_id: file.originalname.split('.').pop() // Usa el nombre con la extesión original para mantener el formato del archivo
      },
      (error, result) => {
        if (error) {
          console.error('Error en Cloudinary:', error);
          reject(new Error('Error al subir a Cloudinary'));
        } else {
          // Si es exitoso, devolvemos la URL segura (https)
          resolve({
            fileName: file.originalname,
            fileUrl: result.secure_url
          });
        }
      }
    );

    // Convertimos el buffer a stream y lo enviamos
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

module.exports = { uploadFile };