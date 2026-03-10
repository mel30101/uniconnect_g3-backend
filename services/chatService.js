const { db } = require('../config/firestrore');

const getOrCreateChat = async (userA, userB) => {
  const chatId = [userA, userB].sort().join('_');
  const chatRef = db.collection('chats').doc(chatId);
  const doc = await chatRef.get();

  if (!doc.exists) {
    await chatRef.set({
      participants: [userA, userB],
      lastMessage: '',
      updatedAt: new Date()
    });
  }

  return chatId;
};

const sendMessage = async (chatId, senderId, messageData) => {

  const isObject = typeof messageData === 'object' && messageData !== null;
  const data = isObject ? messageData : { text: messageData, type: 'text' };

  const messagePayload = {
    senderId,
    createdAt: new Date(),
    type: data.type || 'text',
    text: data.text || '',
    ...(data.fileUrl && { fileUrl: data.fileUrl }),
    ...(data.fileName && { fileName: data.fileName })
  };

  await db
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .add(messagePayload);
  const summaryText = data.type === 'file' 
    ? `📎 Archivo: ${data.fileName}` 
    : data.text;

  await db.collection('chats').doc(chatId).update({
    lastMessage: summaryText,
    updatedAt: new Date()
  });
};

const getMessages = async (chatId) => {
  const snapshot = await db
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

module.exports = {
  getOrCreateChat,
  sendMessage,
  getMessages
};