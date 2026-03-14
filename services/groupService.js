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
    const isUnique = await checkGroupNameUnique(name);

    if (!isUnique) {
        throw new Error('GROUP_NAME_ALREADY_EXISTS');
    }

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
    await db.collection('group_members').add({
        groupId: groupRef.id,
        userId: creatorId,
        role: 'admin',
        joinedAt: new Date()
    });
    return newGroup;
};

const getUserGroups = async (userId, role) => {
    let query = db.collection('group_members').where('userId', '==', userId);

    if (role) {
        query = query.where('role', '==', role);
    }

    const memberSnapshot = await query.get();
    const groupIds = memberSnapshot.docs.map(doc => doc.data().groupId);

    if (groupIds.length === 0) return [];

    const groupsSnapshot = await db.collection('groups')
        .where(admin.firestore.FieldPath.documentId(), 'in', groupIds)
        .get();
    const groups = [];

    for (const doc of groupsSnapshot.docs) {
        const groupData = doc.data();
        const subjectDoc = await db.collection('subjects').doc(groupData.subjectId).get();
        const subjectName = subjectDoc.exists ? subjectDoc.data().name : 'Materia desconocida';
        
        let adminName = 'Desconocido';
        if (groupData.creatorId) {
            const creatorDoc = await db.collection('users').doc(groupData.creatorId).get();
            if (creatorDoc.exists) adminName = creatorDoc.data().name;
        }

        const membersSnapshot = await db.collection('group_members')
            .where('groupId', '==', doc.id)
            .get();
        const memberIds = membersSnapshot.docs.map(m => m.data().userId);
        const userDocs = await Promise.all(memberIds.map(id => db.collection('users').doc(id).get()));
        const memberNames = userDocs.map(u => u.exists ? u.data().name : 'Usuario desconocido');
        groups.push({
            ...groupData,
            subjectName,
            adminName,
            members: memberNames
        });
    }
    return groups;
};

const getGroupById = async (groupId) => {
    const groupDoc = await db.collection('groups').doc(groupId).get();

    if (!groupDoc.exists) return null;

    const groupData = groupDoc.data();
    const subjectDoc = await db.collection('subjects').doc(groupData.subjectId).get();
    const subjectName = subjectDoc.exists ? subjectDoc.data().name : 'Materia desconocida';
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

const searchGroups = async ({ subjectId, search, userSubjectIds, userId }) => {
    if (!search && !subjectId) return [];

    let query = db.collection('groups');

    if (subjectId) {
        query = query.where('subjectId', '==', subjectId);
    }

    const snapshot = await query.get();
    let groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (userSubjectIds) {
        const allowedIds = userSubjectIds.split(',');
        groups = groups.filter(group => allowedIds.includes(group.subjectId));
    }
    
    if (userId) {
        groups = groups.filter(group => group.creatorId !== userId);
    }
    
    if (search) {
        const searchLower = search.toLowerCase();   
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
        groups = groups.map(group => ({
            ...group,
            subjectName: subjectsMap[group.subjectId] || 'Materia desconocida'
        }));
    } else {
        for (let group of groups) {
            const subjectDoc = await db.collection('subjects').doc(group.subjectId).get();
            group.subjectName = subjectDoc.exists ? subjectDoc.data().name : 'Materia desconocida';
        }
    }

    const enrichedGroups = await Promise.all(groups.map(async (group) => {
        let adminName = 'Desconocido';
        if (group.creatorId) {
            const creatorDoc = await db.collection('users').doc(group.creatorId).get();
            if (creatorDoc.exists) adminName = creatorDoc.data().name;
        }

        const membersSnapshot = await db.collection('group_members')
            .where('groupId', '==', group.id)
            .get();
        const memberIds = membersSnapshot.docs.map(m => m.data().userId);
        const userDocs = await Promise.all(memberIds.map(id => db.collection('users').doc(id).get()));
        const memberNames = userDocs.map(u => u.exists ? u.data().name : 'Usuario desconocido');
        return {
            ...group,
            adminName,
            members: memberNames
        };
    }));
    return enrichedGroups;
};

const transferAdminRole = async (groupId, currentAdminId, newAdminId) => {
    return await db.runTransaction(async (transaction) => {
        const groupRef = db.collection('groups').doc(groupId);
        const groupDoc = await transaction.get(groupRef);

        if (!groupDoc.exists) {
            throw new Error('GROUP_NOT_FOUND');
        }

        const currentAdminMemberQuery = await db.collection('group_members')
            .where('groupId', '==', groupId)
            .where('userId', '==', currentAdminId)
            .get();

        if (currentAdminMemberQuery.empty || currentAdminMemberQuery.docs[0].data().role !== 'admin') {
            throw new Error('NOT_AUTHORIZED');
        }

        const newAdminMemberQuery = await db.collection('group_members')
            .where('groupId', '==', groupId)
            .where('userId', '==', newAdminId)
            .get();

        if (newAdminMemberQuery.empty) {
            throw new Error('NEW_ADMIN_NOT_FOUND');
        }

        const currentAdminMemberRef = currentAdminMemberQuery.docs[0].ref;
        const newAdminMemberRef = newAdminMemberQuery.docs[0].ref;

        transaction.update(groupRef, { creatorId: newAdminId });
        transaction.update(newAdminMemberRef, { role: 'admin' });
        transaction.delete(currentAdminMemberRef);
    });
};

module.exports = {
    createGroup,
    checkGroupNameUnique,
    getUserGroups,
    getGroupById,
    searchGroups,
    transferAdminRole
};