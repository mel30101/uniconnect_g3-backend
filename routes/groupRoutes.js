const express = require('express');
const router = express.Router();
const groupService = require('../services/groupService');
const groupController = require('../controllers/groupController');

router.post('/', async (req, res, next) => {
    try {
        const { name, subjectId, description, creatorId } = req.body;

        if (!name || !subjectId || !creatorId) {
            return res.status(400).json({ error: 'MISSING_FIELDS' });
        }

        if (name.length < 3) {
            return res.status(400).json({ error: 'NAME_TOO_SHORT' });
        }

        const newGroup = await groupService.createGroup({
            name,
            subjectId,
            description,
            creatorId
        });

        res.status(201).json(newGroup);
    } catch (error) {
        if (error.message === 'GROUP_NAME_ALREADY_EXISTS') {
            return res.status(400).json({ error: 'GROUP_NAME_ALREADY_EXISTS' });
        }
        next(error);
    }
});

router.get('/check-name/:name', async (req, res) => {
    try {
        const isUnique = await groupService.checkGroupNameUnique(req.params.name);
        res.json({ isUnique });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/user/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.query;

        const groups = await groupService.getUserGroups(userId, role);
        res.json(groups);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const group = await groupService.getGroupById(req.params.id);
        if (!group) {
            return res.status(404).json({ error: 'GROUP_NOT_FOUND' });
        }
        res.json(group);
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const { subjectId, search, userSubjectIds, userId } = req.query;
        const groups = await groupService.searchGroups({ subjectId, search, userSubjectIds, userId });
        res.json(groups);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', groupController.getGroupById);
router.post('/:id/requests', groupController.sendJoinRequest);
router.get('/:id/requests', groupController.getGroupRequests);
router.put('/:id/requests/:requestId', groupController.handleRequestAction);
router.delete('/:id/members/:userId', groupController.removeMember);
router.put('/:id/transfer-admin', groupController.transferAdmin);

router.post('/groups/:id/members', async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.body;
    try {
        await db.collection('group_members').add({
            groupId: id,
            userId,
            role: role || 'student',
            joinedAt: new Date()
        });
        res.json({ message: "Añadido" });
    } catch (e) {
        res.status(500).send(e.message);
    }
});
router.post('/:id/members', groupController.addMember);
router.delete('/:id/leave/:userId', groupController.leaveGroup);

module.exports = router;