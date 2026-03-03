const admin = require('firebase-admin');
const db = admin.firestore();

const searchStudents = async ({ name, subjectId, isMonitor, excludeId }) => {
  let profileQuery = db.collection('academic_profiles');

  // Filtro de Monitoría (Resuelve tu error actual)
  if (isMonitor) {
    profileQuery = profileQuery.where('isMonitor', '==', true);
  }

  // Filtro de Materias
  if (subjectId) {
    const subjectIdsArray = subjectId.split(',');
    profileQuery = profileQuery.where('subjects', 'array-contains-any', subjectIdsArray);
  }

  const profileSnapshot = await profileQuery.get();
  if (profileSnapshot.empty) return [];

  let filteredProfiles = profileSnapshot.docs.map(doc => doc.data());

  // Intersección manual si se buscan múltiples materias (Firestore no hace AND en array-contains)
  if (subjectId && subjectId.includes(',')) {
    const subjectIdsArray = subjectId.split(',');
    filteredProfiles = filteredProfiles.filter(p => 
      subjectIdsArray.every(id => p.subjects.includes(id))
    );
  }

  const studentIds = filteredProfiles.map(p => p.studentId);
  if (studentIds.length === 0) return [];

  // Traer datos de usuarios (limitado a los primeros 10 para evitar lag de 5s)
  const usersSnapshot = await db.collection('users')
    .where('uid', 'in', studentIds.slice(0, 10))
    .get();

  let users = usersSnapshot.docs.map(doc => {
    const userData = doc.data();
    const userProfile = filteredProfiles.find(p => p.studentId === userData.uid);
    return {
      id: doc.id,
      ...userData,
      materiasIds: userProfile ? userProfile.subjects : []
    };
  });

  // Filtros finales en memoria (Nombre y Exclusión)
  if (excludeId) users = users.filter(u => u.id !== excludeId);
  if (name) {
    const searchName = name.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(searchName));
  }

  return users;
};

module.exports = { searchStudents };