const groupService = require('../services/groupService');
const admin = require('firebase-admin');
const db = admin.firestore();

const sendJoinRequest = async (req, res) => {
    try {
        const { id } = req.params; 
        const { userId, userName } = req.body;

        if (!userId || !userName) {
            return res.status(400).json({ error: "userId y userName son requeridos" });
        }

        const group = await groupService.getGroupById(id);
        if (!group) {
            return res.status(404).json({ error: "El grupo no existe" });
        }

        const isMember = group.members.some(m => m.id === userId);
        if (isMember) {
            return res.status(400).json({ error: "Ya eres miembro de este grupo" });
        }

        const requestRef = db.collection('groups').doc(id).collection('requests').doc(userId);
        const requestDoc = await requestRef.get();

        if (requestDoc.exists) {
            return res.status(400).json({ error: "Ya tienes una solicitud pendiente para este grupo" });
        }

        await requestRef.set({
            userId,
            userName,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: "Solicitud enviada con éxito" });
    } catch (error) {
        console.error("Error en sendJoinRequest:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

const getGroupRequests = async (req, res) => {
    try {
        const { id } = req.params;
        const requestsSnapshot = await db.collection('groups').doc(id).collection('requests')
            .where('status', '==', 'pending')
            .get();

        const requests = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener solicitudes" });
    }
};

const handleRequestAction = async (req, res) => {
    try {
        const { id, requestId } = req.params; 
        const { status } = req.body; 

        const requestRef = db.collection('groups').doc(id).collection('requests').doc(requestId);
        
        if (status === 'accepted') {
            await db.collection('group_members').add({
                groupId: id,
                userId: requestId,
                role: 'student',
                joinedAt: new Date()
            });
            await requestRef.update({ status: 'accepted' });
        } else {
            await requestRef.update({ status: 'rejected' });
        }

        res.status(200).json({ message: `Solicitud ${status} correctamente` });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la acción" });
    }
};

const transferAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId, newAdminId } = req.body;

        if (!adminId || !newAdminId) {
            return res.status(400).json({ error: "adminId y newAdminId son requeridos" });
        }

        await groupService.transferAdminRole(id, adminId, newAdminId);
        res.status(200).json({ message: "Administración cedida con éxito." });
    } catch (error) {
        console.error("Error en transferAdmin:", error);
        if (error.message === 'NOT_AUTHORIZED' || error.message === 'GROUP_NOT_FOUND' || error.message === 'NEW_ADMIN_NOT_FOUND') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = {
    sendJoinRequest,
    getGroupRequests,
    handleRequestAction,
    transferAdmin,
    getGroupById: async (req, res) => {
        const group = await groupService.getGroupById(req.params.id);
        group ? res.json(group) : res.status(404).send("No encontrado");
    },
    createGroup: async (req, res) => {
        const newGroup = await groupService.createGroup(req.body);
        res.status(201).json(newGroup);
    },
    updateGroup: async (req, res) => {
        const updatedGroup = await groupService.updateGroup(req.params.id, req.body);
        updatedGroup ? res.json(updatedGroup) : res.status(404).send("No encontrado");
    },
    deleteGroup: async (req, res) => {
        const success = await groupService.deleteGroup(req.params.id);
        success ? res.status(204).send() : res.status(404).send("No encontrado");
    },
    getAllGroups: async (req, res) => {
        const groups = await groupService.getAllGroups();
        res.json(groups);
    }
};