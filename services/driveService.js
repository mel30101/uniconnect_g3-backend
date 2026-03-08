const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const stream = require("stream");
const path = require("path");

const KEYFILEPATH = path.join(__dirname, "../config/causal-galaxy-460412-r8-fd4c91cf9f80.json");

const FOLDER_ID = "1NiDR9VD7RTogsKVrQGjT5oWrl_CM6-ih?usp=sharing";

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive = google.drive({
  version: "v3",
  auth
});

const uploadFile = async (file) => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  const fileName = `${uuidv4()}_${file.originalname}`;

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [FOLDER_ID]
    },
    media: {
      mimeType: file.mimetype,
      body: bufferStream
    }
  });

  const fileId = response.data.id;

  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: "reader",
      type: "anyone"
    }
  });

  const fileUrl = `https://drive.google.com/uc?id=${fileId}`;

  return {
    fileName: file.originalname,
    fileUrl
  };
};

module.exports = {
  uploadFile
};
