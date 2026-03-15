// Interfaz/Contrato para el repositorio de catálogos académicos
// (faculties, academic_levels, formation_levels, careers, sections, subjects, academic_mappings)

class IAcademicCatalogRepository {
  async getAllFaculties() {
    throw new Error('Not implemented');
  }

  async getAllCareers() {
    throw new Error('Not implemented');
  }

  async getAllSubjects() {
    throw new Error('Not implemented');
  }

  async getSubjectById(id) {
    throw new Error('Not implemented');
  }

  async getSubjectsByIds(ids) {
    throw new Error('Not implemented');
  }

  async getSectionsByCareerId(careerId) {
    throw new Error('Not implemented');
  }

  async getMappingsByFilter(filter) {
    throw new Error('Not implemented');
  }

  async getMappingById(id) {
    throw new Error('Not implemented');
  }

  async getAcademicLevelById(id) {
    throw new Error('Not implemented');
  }

  async getFormationLevelById(id) {
    throw new Error('Not implemented');
  }

  async getFacultyById(id) {
    throw new Error('Not implemented');
  }

  async getCareerById(id) {
    throw new Error('Not implemented');
  }

  async getAcademicLevelsByIds(ids) {
    throw new Error('Not implemented');
  }

  async getFormationLevelsByIds(ids) {
    throw new Error('Not implemented');
  }

  async getCareersByIds(ids) {
    throw new Error('Not implemented');
  }
}

module.exports = IAcademicCatalogRepository;
