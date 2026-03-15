// Interfaz/Contrato para el repositorio de miembros de grupo

class IGroupMemberRepository {
  async findByGroupId(groupId) {
    throw new Error('Not implemented');
  }

  async findByUserId(userId, role) {
    throw new Error('Not implemented');
  }

  async findByGroupAndUser(groupId, userId) {
    throw new Error('Not implemented');
  }

  async add(memberData) {
    throw new Error('Not implemented');
  }

  async remove(groupId, userId) {
    throw new Error('Not implemented');
  }

  async updateRole(groupId, userId, newRole) {
    throw new Error('Not implemented');
  }
}

module.exports = IGroupMemberRepository;
