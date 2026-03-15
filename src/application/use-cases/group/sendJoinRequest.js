class SendJoinRequest {
  constructor(groupRepo, groupMemberRepo, groupRequestRepo) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
  }

  async execute(groupId, { userId, userName }) {
    if (!userId || !userName) {
      throw new Error('MISSING_FIELDS');
    }

    // Verificar que el grupo existe
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('GROUP_NOT_FOUND');
    }

    // Verificar que no sea miembro
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (member) {
      throw new Error('ALREADY_MEMBER');
    }

    // Verificar que no tenga solicitud pendiente
    const existingRequest = await this.groupRequestRepo.findByGroupAndUser(groupId, userId);
    if (existingRequest) {
      throw new Error('REQUEST_ALREADY_EXISTS');
    }

    // Crear la solicitud
    await this.groupRequestRepo.create(groupId, userId, { userId, userName });
    return { message: 'Solicitud enviada con éxito' };
  }
}

module.exports = SendJoinRequest;
