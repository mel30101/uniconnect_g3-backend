const chatService = require('../services/chatService');

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

const getMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const message = await chatService.getMessage(chatId);

    } catch (error) {
        res.status(500).json({ error: error.message });
    };
};

module.exports = {
    createChat,
    sendMessage,
    getMessage
}
