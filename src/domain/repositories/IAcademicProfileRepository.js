// Interfaz/Contrato para el repositorio de perfiles académicos

class IAcademicProfileRepository {
  async findByStudentId(studentId) {
    throw new Error('Not implemented');
  }

  async save(studentId, profileData) {
    throw new Error('Not implemented');
  }
}

module.exports = IAcademicProfileRepository;
