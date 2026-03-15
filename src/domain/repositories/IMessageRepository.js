// Interfaz/Contrato para el repositorio de mensajes

class IMessageRepository {
  async findByChatId(chatId) {
    throw new Error('Not implemented');
  }

  async create(chatId, messageData) {
    throw new Error('Not implemented');
  }
}

module.exports = IMessageRepository;
