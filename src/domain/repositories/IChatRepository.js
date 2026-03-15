// Interfaz/Contrato para el repositorio de chats

class IChatRepository {
  async findById(chatId) {
    throw new Error('Not implemented');
  }

  async create(chatId, chatData) {
    throw new Error('Not implemented');
  }

  async updateLastMessage(chatId, text) {
    throw new Error('Not implemented');
  }
}

module.exports = IChatRepository;
