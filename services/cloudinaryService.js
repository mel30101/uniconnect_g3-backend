const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    const extension = file.originalname.includes('.') ? file.originalname.split('.').pop().toLowerCase() : '';
    const isRaw = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar'].includes(extension);

    const uploadOptions = {
      folder: 'uniconnect_chats',
      resource_type: isRaw ? 'raw' : 'auto',
      public_id: `archivo_${Date.now()}_${file.originalname.replace(/\\.[^/.]+$/, "")}${isRaw && extension ? '.' + extension : ''}`
    };

    if (!isRaw && extension) {
      uploadOptions.format = extension;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
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