const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const upload = require("../middlewares/uploadMiddleware");
const { sendFileMessage } = require("../controllers/chatController");

router.post('/', chatController.createChat);
router.post('/:chatId/messages', chatController.sendMessage);
router.get('/:chatId/messages', chatController.getMessage);
router.post("/send-file", upload.single("file"), sendFileMessage);

module.exports = router;