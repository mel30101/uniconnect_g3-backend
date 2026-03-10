const express = require('express');
const router = express.Router();
const { db } = require('../config/firestrore');

// Get all faculties
router.get('/faculties', async (req, res, next) => {
    try {
        const snapshot = await db.collection('faculties').get();
        const faculties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(faculties);
    } catch (error) {
        next(error);
    }
});

// Get academic levels by faculty
router.get('/academic-levels/:facultyId', async (req, res, next) => {
    try {
        const mappingsSnapshot = await db.collection('academic_mappings')
            .where('facultyId', '==', req.params.facultyId)
            .get();

        const levelIds = [...new Set(mappingsSnapshot.docs.map(doc => doc.data().academicLevelId))];

        const levels = await Promise.all(levelIds.map(async id => {
            const doc = await db.collection('academic_levels').doc(id).get();
            return { id: doc.id, ...doc.data() };
        }));

        res.json(levels);
    } catch (error) {
        next(error);
    }
});

// Get formation levels by academic level and faculty
router.get('/formation-levels/:facultyId/:academicLevelId', async (req, res, next) => {
    try {
        const mappingsSnapshot = await db.collection('academic_mappings')
            .where('facultyId', '==', req.params.facultyId)
            .where('academicLevelId', '==', req.params.academicLevelId)
            .get();

        const formationIds = [...new Set(mappingsSnapshot.docs.map(doc => doc.data().formationLevelId))];

        const levels = await Promise.all(formationIds.map(async id => {
            const doc = await db.collection('formation_levels').doc(id).get();
            return { id: doc.id, ...doc.data() };
        }));

        res.json(levels);
    } catch (error) {
        next(error);
    }
});

// Get careers by academic path
router.get('/careers-by-path/:facultyId/:academicLevelId/:formationLevelId', async (req, res, next) => {
    try {
        const mappingsSnapshot = await db.collection('academic_mappings')
            .where('facultyId', '==', req.params.facultyId)
            .where('academicLevelId', '==', req.params.academicLevelId)
            .where('formationLevelId', '==', req.params.formationLevelId)
            .get();

        const careerIds = mappingsSnapshot.docs.map(doc => doc.data().careerId);

        const careers = await Promise.all(careerIds.map(async id => {
            const doc = await db.collection('careers').doc(id).get();
            return { id: doc.id, ...doc.data() };
        }));

        res.json(careers);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
