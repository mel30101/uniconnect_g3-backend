// Interfaz/Contrato para el repositorio de solicitudes de grupo

class IGroupRequestRepository {
  async findPendingByGroupId(groupId) {
    throw new Error('Not implemented');
  }

  async findByGroupAndUser(groupId, userId) {
    throw new Error('Not implemented');
  }

  async create(groupId, userId, requestData) {
    throw new Error('Not implemented');
  }

  async updateStatus(groupId, userId, status) {
    throw new Error('Not implemented');
  }
}

module.exports = IGroupRequestRepository;
