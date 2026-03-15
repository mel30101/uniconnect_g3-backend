// Interfaz/Contrato para el repositorio de usuarios
// Las implementaciones concretas (Firestore, MongoDB, etc.) deben heredar de esta clase

class IUserRepository {
  async findById(userId) {
    throw new Error('Not implemented');
  }

  async findByIds(userIds) {
    throw new Error('Not implemented');
  }

  async save(userId, userData) {
    throw new Error('Not implemented');
  }

  async findAll() {
    throw new Error('Not implemented');
  }
}

module.exports = IUserRepository;
