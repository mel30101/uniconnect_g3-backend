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

const sendMessage = async (chatId, senderId, text) => {
  await db
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .add({
      senderId,
      text,
      createdAt: new Date()
    });

  await db.collection('chats').doc(chatId).update({
    lastMessage: text,
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