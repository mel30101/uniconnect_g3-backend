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

  // Resolve hierarchy from academic_mappings if mappingId exists
  let mappingData = {};
  if (profileData.mappingId) {
    const mappingDoc = await db.collection('academic_mappings').doc(profileData.mappingId).get();
    if (mappingDoc.exists) {
      mappingData = mappingDoc.data();
    }
  }

  // Use mappingData if available, fallback to profileData for backward compatibility
  const facultyId = mappingData.facultyId || profileData.facultyId;
  const academicLevelId = mappingData.academicLevelId || profileData.academicLevelId;
  const formationLevelId = mappingData.formationLevelId || profileData.formationLevelId;
  const careerId = mappingData.careerId || profileData.careerId;

  // Consultas paralelas de catálogos
  const [facultyDoc, academicLevelDoc, formationLevelDoc, careerDoc, subjectsDocs] = await Promise.all([
    facultyId ? db.collection('faculties').doc(facultyId).get() : Promise.resolve({ exists: false }),
    academicLevelId ? db.collection('academic_levels').doc(academicLevelId).get() : Promise.resolve({ exists: false }),
    formationLevelId ? db.collection('formation_levels').doc(formationLevelId).get() : Promise.resolve({ exists: false }),
    careerId ? db.collection('careers').doc(careerId).get() : Promise.resolve({ exists: false }),
    profileData.subjects ? Promise.all(profileData.subjects.map(id => db.collection('subjects').doc(id).get())) : Promise.resolve([])
  ]);

  return {
    ...userData,
    ...profileData,
    // Add hierarchical IDs for compatibility
    facultyId,
    academicLevelId,
    formationLevelId,
    careerId,
    userName: userData.name || "Sin nombre",
    facultyName: facultyDoc.exists ? facultyDoc.data().name : "No especificada",
    academicLevelName: academicLevelDoc.exists ? academicLevelDoc.data().name : "No especificado",
    formationLevelName: formationLevelDoc.exists ? formationLevelDoc.data().name : "No especificado",
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
    facultyId,
    academicLevelId,
    formationLevelId,
    careerId,
    subjects,
  } = data;

  console.log("DATOS RECIBIDOS PARA GUARDAR:", data);

  // Find mappingId from academic_mappings
  const mappingSnap = await db.collection('academic_mappings')
    .where('facultyId', '==', facultyId)
    .where('academicLevelId', '==', academicLevelId)
    .where('formationLevelId', '==', formationLevelId)
    .where('careerId', '==', careerId)
    .limit(1)
    .get();

  let mappingId = "";
  if (!mappingSnap.empty) {
    mappingId = mappingSnap.docs[0].id;
  } else {
    console.warn("No matching academic mapping found for:", { facultyId, academicLevelId, formationLevelId, careerId });
  }

  // 1. Save personal information to the 'users' collection
  const personalInfo = {
    biography: biography || "",
    showEmail: showEmail ?? true,
    phone: phone || "",
    age: age || "",
    studyPreference: studyPreference || "",
    updatedAt: new Date(),
    institutionalEmail: admin.firestore.FieldValue.delete(),
  };
  await db.collection("users").doc(studentId).set(personalInfo, { merge: true });

  // 2. Save academic information to the 'academic_profiles' collection
  const academicInfo = {
    studentId,
    mappingId, // Store mappingId instead of hierarchical IDs
    subjects: subjects || [],
    updatedAt: new Date(),
    institutionalEmail: admin.firestore.FieldValue.delete(),
    isMonitor: admin.firestore.FieldValue.delete(),
    // Explicitly delete old fields
    facultyId: admin.firestore.FieldValue.delete(),
    academicLevelId: admin.firestore.FieldValue.delete(),
    formationLevelId: admin.firestore.FieldValue.delete(),
    careerId: admin.firestore.FieldValue.delete(),
  };

  console.log("OBJETO academicInfo A GUARDAR EN FIRESTORE:", academicInfo);

  await db.collection("academic_profiles").doc(studentId).set(academicInfo, { merge: true });

  // Sincronización: Retornamos el perfil completo (donde getFullProfile resolverá los nombres dinámicamente)
  const result = await getFullProfile(studentId);
  console.log("PERFIL COMPLETO RETORNADO TRAS GUARDAR (Nombres resueltos dinámicamente):", result);
  return result;
};

module.exports = { getFullProfile, saveAcademicProfile };