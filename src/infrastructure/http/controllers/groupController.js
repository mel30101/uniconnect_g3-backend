class GroupController {
  constructor(useCases) {
    this.createGroupUC = useCases.createGroup;
    this.getUserGroupsUC = useCases.getUserGroups;
    this.getGroupByIdUC = useCases.getGroupById;
    this.searchGroupsUC = useCases.searchGroups;
    this.checkGroupNameUniqueUC = useCases.checkGroupNameUnique;
    this.sendJoinRequestUC = useCases.sendJoinRequest;
    this.getGroupRequestsUC = useCases.getGroupRequests;
    this.handleRequestActionUC = useCases.handleRequestAction;
    this.removeMemberUC = useCases.removeMember;
    this.transferAdminUC = useCases.transferAdmin;
    this.addMemberUC = useCases.addMember;
    this.leaveGroupUC = useCases.leaveGroup;
    this.getAvailableStudentsUC = useCases.getAvailableStudents;
  }

  createGroup = async (req, res, next) => {
    try {
      const result = await this.createGroupUC.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'GROUP_NAME_ALREADY_EXISTS' || error.message === 'MISSING_FIELDS' || error.message === 'NAME_TOO_SHORT') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  };

  getUserGroups = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { role } = req.query;
      const groups = await this.getUserGroupsUC.execute(userId, role);
      res.json(groups);
    } catch (error) {
      next(error);
    }
  };

  getGroupById = async (req, res, next) => {
    try {
      const group = await this.getGroupByIdUC.execute(req.params.id);
      if (!group) {
        return res.status(404).json({ error: 'GROUP_NOT_FOUND' });
      }
      res.json(group);
    } catch (error) {
      next(error);
    }
  };

  searchGroups = async (req, res, next) => {
    try {
      const { subjectId, search, userSubjectIds, userId } = req.query;
      const groups = await this.searchGroupsUC.execute({ subjectId, search, userSubjectIds, userId });
      res.json(groups);
    } catch (error) {
      next(error);
    }
  };

  checkGroupNameUnique = async (req, res, next) => {
    try {
      const isUnique = await this.checkGroupNameUniqueUC.execute(req.params.name);
      res.json({ isUnique });
    } catch (error) {
      next(error);
    }
  };

  sendJoinRequest = async (req, res, next) => {
    try {
      const result = await this.sendJoinRequestUC.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'MISSING_FIELDS') return res.status(400).json({ error: "userId y userName son requeridos" });
      if (error.message === 'GROUP_NOT_FOUND') return res.status(404).json({ error: "El grupo no existe" });
      if (error.message === 'ALREADY_MEMBER') return res.status(400).json({ error: "Ya eres miembro de este grupo" });
      if (error.message === 'REQUEST_ALREADY_EXISTS') return res.status(400).json({ error: "Ya tienes una solicitud pendiente para este grupo" });
      console.error("Error en sendJoinRequest:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  getGroupRequests = async (req, res, next) => {
    try {
      const requests = await this.getGroupRequestsUC.execute(req.params.id);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener solicitudes" });
    }
  };

  handleRequestAction = async (req, res, next) => {
    try {
      const result = await this.handleRequestActionUC.execute(req.params.id, req.params.requestId, req.body.status);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al procesar la acción" });
    }
  };

  removeMember = async (req, res, next) => {
    try {
      const result = await this.removeMemberUC.execute(req.params.id, req.params.userId, req.query.adminId);
      res.json(result);
    } catch (error) {
      if (error.message === 'NOT_AUTHORIZED') return res.status(403).json({ error: "No tienes permisos de administrador en este grupo" });
      if (error.message === 'CANNOT_REMOVE_SELF') return res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
      if (error.message === 'MEMBER_NOT_FOUND') return res.status(404).json({ error: "El usuario no pertenece a este grupo" });
      console.error("Error en removeMember:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  transferAdmin = async (req, res, next) => {
    try {
      const { adminId, newAdminId } = req.body;
      await this.transferAdminUC.execute(req.params.id, adminId, newAdminId);
      res.status(200).json({ message: "Administración cedida con éxito." });
    } catch (error) {
      console.error("Error en transferAdmin:", error);
      if (['NOT_AUTHORIZED', 'GROUP_NOT_FOUND', 'NEW_ADMIN_NOT_FOUND', 'MISSING_FIELDS'].includes(error.message)) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  addMember = async (req, res, next) => {
    try {
      const result = await this.addMemberUC.execute(req.params.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'ALREADY_MEMBER') return res.status(400).json({ error: "El usuario ya es miembro de este grupo" });
      console.error("Error al añadir miembro:", error);
      res.status(500).json({ error: "No se pudo añadir al miembro" });
    }
  };

  leaveGroup = async (req, res, next) => {
    try {
      const result = await this.leaveGroupUC.execute(req.params.id, req.params.userId);
      res.json(result);
    } catch (error) {
      if (error.message === 'NOT_A_MEMBER') return res.status(404).json({ error: "No eres miembro de este grupo" });
      res.status(500).json({ error: "Error al intentar salir del grupo" });
    }
  };
}

module.exports = GroupController;
