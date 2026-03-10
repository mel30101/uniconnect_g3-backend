const chatService = require('../services/chatService');
const cloudinaryService = require('../services/cloudinaryService');

const createChat = async (req, res) => {
    try {
        const { userA, userB } = req.body;
        if (!userA || !userB) {
            return res.status(400).json({ error: "faltan usuarios" });
        }

        const chatId = await chatService.getOrCreateChat(userA, userB);
        res.json({ chatId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { senderId, text } = req.body;

        if (!senderId || !text) {
            return res.status(400).json({ error: "Datos incompletos" });
        }

        await chatService.sendMessage(chatId, senderId, text);
        res.sendStatus(200);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const sendFileMessage = async (req, res) => {
    try {
        console.log("Cuerpo recibido:", req.body);
        console.log("Archivo recibido:", req.file);
        const { chatId } = req.params;
        const { senderId } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "Archivo no subido" });
        }
        const uploadedFile = await cloudinaryService.uploadFile(file);
        const messageText = `Archivo: ${uploadedFile.fileName} - URL: ${uploadedFile.fileUrl}`;
        await chatService.sendMessage(
            chatId, 
            senderId,
            {
                type: 'file',
                fileUrl: uploadedFile.fileUrl,
                fileName: uploadedFile.fileName,
                text: `Envió un archivo: ${uploadedFile.fileName}` 
            }
        );
        res.json({ 
            fileUrl: uploadedFile.fileUrl,
            fileName: uploadedFile.fileName 
         });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const message = await chatService.getMessage(chatId);
        res.json({ messages: message });

    } catch (error) {
        res.status(500).json({ error: error.message });
    };
};

module.exports = {
    createChat,
    sendMessage,
    sendFileMessage,
    getMessage
};
