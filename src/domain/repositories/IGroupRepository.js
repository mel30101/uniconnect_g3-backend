// Interfaz/Contrato para el repositorio de grupos

class IGroupRepository {
  async findById(groupId) {
    throw new Error('Not implemented');
  }

  async create(groupData) {
    throw new Error('Not implemented');
  }

  async update(groupId, data) {
    throw new Error('Not implemented');
  }

  async delete(groupId) {
    throw new Error('Not implemented');
  }

  async findAll() {
    throw new Error('Not implemented');
  }

  async findByName(name) {
    throw new Error('Not implemented');
  }

  async updateCreatorId(groupId, newCreatorId) {
    throw new Error('Not implemented');
  }
}

module.exports = IGroupRepository;
