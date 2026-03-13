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

        // 1. Verificamos si el grupo existe 
        const group = await groupService.getGroupById(id);
        if (!group) {
            return res.status(404).json({ error: "El grupo no existe" });
        }

        // 2. Verificamos si ya es miembro 
        const isMember = group.members.some(m => m.id === userId);
        if (isMember) {
            return res.status(400).json({ error: "Ya eres miembro de este grupo" });
        }

        // 3. Verificamos si ya existe una solicitud pendiente
        const requestRef = db.collection('groups').doc(id).collection('requests').doc(userId);
        const requestDoc = await requestRef.get();

        if (requestDoc.exists) {
            return res.status(400).json({ error: "Ya tienes una solicitud pendiente para este grupo" });
        }

        // 4. Guardamos la solicitud
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

module.exports = {
    sendJoinRequest,
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