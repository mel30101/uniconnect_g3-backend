const admin = require('firebase-admin');
const db = admin.firestore();

const checkGroupNameUnique = async (name) => {
    const snapshot = await db.collection('groups')
        .where('name', '==', name)
        .limit(1)
        .get();
    return snapshot.empty;
};

const createGroup = async (groupData) => {
    const { name, subjectId, description, creatorId } = groupData;

    // 1. Validar nombre único
    const isUnique = await checkGroupNameUnique(name);
    if (!isUnique) {
        throw new Error('GROUP_NAME_ALREADY_EXISTS');
    }

    // 2. Crear el grupo
    const groupRef = db.collection('groups').doc();
    const newGroup = {
        id: groupRef.id,
        name,
        subjectId,
        description: description || '',
        creatorId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await groupRef.set(newGroup);

    // 3. Asignar al creador como admin en la tabla de miembros
    await db.collection('group_members').add({
        groupId: groupRef.id,
        userId: creatorId,
        role: 'admin',
        joinedAt: new Date()
    });

    return newGroup;
};

const getUserGroups = async (userId, role) => {
    // 1. Buscar los IDs de los grupos donde el usuario tiene el rol especificado
    let query = db.collection('group_members').where('userId', '==', userId);
    if (role) {
        query = query.where('role', '==', role);
    }

    const memberSnapshot = await query.get();
    const groupIds = memberSnapshot.docs.map(doc => doc.data().groupId);

    if (groupIds.length === 0) return [];

    // 2. Obtener los detalles de esos grupos
    // Nota: Firestore 'in' query permite hasta 30 IDs
    const groupsSnapshot = await db.collection('groups')
        .where(admin.firestore.FieldPath.documentId(), 'in', groupIds)
        .get();

    const groups = [];
    for (const doc of groupsSnapshot.docs) {
        const groupData = doc.data();

        // Obtener el nombre de la materia
        const subjectDoc = await db.collection('subjects').doc(groupData.subjectId).get();
        const subjectName = subjectDoc.exists ? subjectDoc.data().name : 'Materia desconocida';

        // Obtener lista de miembros (nombres)
        const membersSnapshot = await db.collection('group_members')
            .where('groupId', '==', doc.id)
            .get();

        const memberIds = membersSnapshot.docs.map(m => m.data().userId);
        const userDocs = await Promise.all(memberIds.map(id => db.collection('users').doc(id).get()));
        const memberNames = userDocs.map(u => u.exists ? u.data().name : 'Usuario desconocido');

        groups.push({
            ...groupData,
            subjectName,
            members: memberNames
        });
    }

    return groups;
};

const getGroupById = async (groupId) => {
    const groupDoc = await db.collection('groups').doc(groupId).get();
    if (!groupDoc.exists) return null;

    const groupData = groupDoc.data();

    // Obtener nombre de la materia
    const subjectDoc = await db.collection('subjects').doc(groupData.subjectId).get();
    const subjectName = subjectDoc.exists ? subjectDoc.data().name : 'Materia desconocida';

    // Obtener miembros
    const membersSnapshot = await db.collection('group_members')
        .where('groupId', '==', groupId)
        .get();

    const memberIds = membersSnapshot.docs.map(m => m.data().userId);
    const userDocs = await Promise.all(memberIds.map(id => db.collection('users').doc(id).get()));
    const memberDetails = userDocs.map(u => ({
        id: u.id,
        name: u.exists ? u.data().name : 'Usuario desconocido',
        role: membersSnapshot.docs.find(m => m.data().userId === u.id).data().role
    }));

    return {
        ...groupData,
        subjectName,
        members: memberDetails
    };
};

const searchGroups = async ({ subjectId, search, userSubjectIds }) => {
    // Si no hay búsqueda ni filtro, retornar vacío
    if (!search && !subjectId) return [];

    let query = db.collection('groups');

    // Filtro por materia exacta
    if (subjectId) {
        query = query.where('subjectId', '==', subjectId);
    }

    const snapshot = await query.get();
    let groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtrar por materias del usuario si se proporcionan
    if (userSubjectIds) {
        const allowedIds = userSubjectIds.split(',');
        groups = groups.filter(group => allowedIds.includes(group.subjectId));
    }

    // Búsqueda por texto (nombre de grupo o nombre de materia)
    if (search) {
        const searchLower = search.toLowerCase();
        
        // Obtener todas las materias para buscar por nombre de materia
        const subjectsSnapshot = await db.collection('subjects').get();
        const subjectsMap = {};
        subjectsSnapshot.docs.forEach(doc => {
            subjectsMap[doc.id] = doc.data().name;
        });

        groups = groups.filter(group => {
            const searchTerms = searchLower.split(' ').filter(t => t.length > 0);
            
            const checkMatch = (text) => {
                if (!text) return false;
                const words = text.toLowerCase().split(' ');
                return searchTerms.every(term => 
                    words.some(word => word.startsWith(term))
                );
            };

            const groupNameMatches = checkMatch(group.name);
            const subjectName = subjectsMap[group.subjectId] || '';
            const subjectMatches = checkMatch(subjectName);
            
            return groupNameMatches || subjectMatches;
        });

        // Enriquecer con subjectName
        groups = groups.map(group => ({
            ...group,
            subjectName: subjectsMap[group.subjectId] || 'Materia desconocida'
        }));
    } else {
        // Enriquecer con subjectName si solo hay subjectId
        for (let group of groups) {
            const subjectDoc = await db.collection('subjects').doc(group.subjectId).get();
            group.subjectName = subjectDoc.exists ? subjectDoc.data().name : 'Materia desconocida';
        }
    }

    // Obtener miembros para cada grupo
    const enrichedGroups = await Promise.all(groups.map(async (group) => {
        const membersSnapshot = await db.collection('group_members')
            .where('groupId', '==', group.id)
            .get();
        
        const memberIds = membersSnapshot.docs.map(m => m.data().userId);
        const userDocs = await Promise.all(memberIds.map(id => db.collection('users').doc(id).get()));
        const memberNames = userDocs.map(u => u.exists ? u.data().name : 'Usuario desconocido');

        return {
            ...group,
            members: memberNames
        };
    }));

    return enrichedGroups;
};

module.exports = {
    createGroup,
    checkGroupNameUnique,
    getUserGroups,
    getGroupById,
    searchGroups
};
