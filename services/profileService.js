const admin = require('firebase-admin');
const db = admin.firestore();

const getFullProfile = async (studentId) => {
  // Ejecución en paralelo para mejorar performance
  const [profileDoc, userDoc] = await Promise.all([
    db.collection('academic_profiles').doc(studentId).get(),
    db.collection('users').doc(studentId).get()
  ]);

  if (!profileDoc.exists) throw new Error('PROFILE_NOT_FOUND');

  const profileData = profileDoc.data();
  
  // Consultas paralelas de catálogos
  const [careerDoc, subjectsDocs] = await Promise.all([
    db.collection('careers').doc(profileData.careerId).get(),
    Promise.all(profileData.subjects.map(id => db.collection('subjects').doc(id).get()))
  ]);

  return {
    ...profileData,
    userName: userDoc.exists ? userDoc.data().name : "Sin nombre",
    careerName: careerDoc.exists ? careerDoc.data().name : "No encontrada",
    subjectNames: subjectsDocs.map(d => d.exists ? d.data().name : "Materia desconocida")
  };
};

const saveAcademicProfile = async (data) => {
  const { studentId, ...rest } = data;

  await db.collection('academic_profiles').doc(studentId).set(
    { studentId,...rest, updatedAt: new Date() }, 
    { merge: true }
  );
  return { success: true, message: "Perfil guardado" };
};

module.exports = { getFullProfile, saveAcademicProfile };