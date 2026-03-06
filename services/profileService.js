const admin = require('firebase-admin');
const db = admin.firestore();

const getFullProfile = async (studentId) => {
  // Ejecución en paralelo para mejorar performance
  const [profileDoc, userDoc] = await Promise.all([
    db.collection('academic_profiles').doc(studentId).get(),
    db.collection('users').doc(studentId).get()
  ]);

  const profileData = profileDoc.exists ? profileDoc.data() : {};
  const userData = userDoc.exists ? userDoc.data() : {};

  // Si no existe ni el usuario ni el perfil académico
  if (!userDoc.exists && !profileDoc.exists) {
    throw new Error('PROFILE_NOT_FOUND');
  }

  // Consultas paralelas de catálogos
  const [careerDoc, subjectsDocs] = await Promise.all([
    profileData.careerId ? db.collection('careers').doc(profileData.careerId).get() : Promise.resolve({ exists: false }),
    profileData.subjects ? Promise.all(profileData.subjects.map(id => db.collection('subjects').doc(id).get())) : Promise.resolve([])
  ]);

  return {
    ...profileData,
    ...userData,
    userName: userData.name || "Sin nombre",
    careerName: careerDoc.exists ? careerDoc.data().name : "No encontrada",
    subjectNames: subjectsDocs.map(d => d.exists ? d.data().name : "Materia desconocida")
  };
};

const saveAcademicProfile = async (data) => {
  const {
    studentId,
    // Personal information
    biography,
    showEmail,
    phone,
    age,
    studyPreference,
    // Academic information
    careerId,
    subjects,
  } = data;

  // 1. Save personal information to the 'users' collection
  const personalInfo = {
    biography: biography || "",
    showEmail: showEmail ?? true,
    phone: phone || "",
    age: age || "",
    studyPreference: studyPreference || "",
    updatedAt: new Date(),
    // Explicitly remove the redundant field if it exists
    institutionalEmail: admin.firestore.FieldValue.delete(),
  };
  await db.collection("users").doc(studentId).set(personalInfo, { merge: true });

  // 2. Save academic information to the 'academic_profiles' collection
  const academicInfo = {
    studentId,
    careerId,
    subjects: subjects || [],
    updatedAt: new Date(),
    // Explicitly remove the redundant field if it exists
    institutionalEmail: admin.firestore.FieldValue.delete(),
    isMonitor: admin.firestore.FieldValue.delete(),
  };
  await db.collection("academic_profiles").doc(studentId).set(academicInfo, { merge: true });

  return { success: true, message: "Perfil guardado correctamente en ambas colecciones" };
};

module.exports = { getFullProfile, saveAcademicProfile };