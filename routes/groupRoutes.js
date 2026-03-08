const express = require('express');
const router = express.Router();
const groupService = require('../services/groupService');

// POST /api/groups
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

// GET /api/groups/check-name/:name
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

module.exports = router;
