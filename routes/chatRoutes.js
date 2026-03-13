const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { upload } = require("../middlewares/uploadMiddleware");

router.post('/', chatController.createChat);
router.post('/:chatId/messages', chatController.sendMessage);
router.get('/:chatId/messages', chatController.getMessage);

router.post("/:chatId/files", upload.single("file"), chatController.sendFileMessage);

module.exports = router;
