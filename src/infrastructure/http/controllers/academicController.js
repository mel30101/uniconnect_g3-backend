class AcademicController {
  constructor(useCases) {
    this.getAllFacultiesUC = useCases.getAllFaculties;
    this.getAcademicLevelsByFacultyUC = useCases.getAcademicLevelsByFaculty;
    this.getFormationLevelsUC = useCases.getFormationLevels;
    this.getCareersByPathUC = useCases.getCareersByPath;
    this.getAllCareersUC = useCases.getAllCareers;
    this.getAllSubjectsUC = useCases.getAllSubjects;
    this.getCareerStructureUC = useCases.getCareerStructure;
  }

  getAllFaculties = async (req, res, next) => {
    try {
      const faculties = await this.getAllFacultiesUC.execute();
      res.json(faculties);
    } catch (error) {
      next(error);
    }
  };

  getAcademicLevelsByFaculty = async (req, res, next) => {
    try {
      const levels = await this.getAcademicLevelsByFacultyUC.execute(req.params.facultyId);
      res.json(levels);
    } catch (error) {
      next(error);
    }
  };

  getFormationLevels = async (req, res, next) => {
    try {
      const levels = await this.getFormationLevelsUC.execute(req.params.facultyId, req.params.academicLevelId);
      res.json(levels);
    } catch (error) {
      next(error);
    }
  };

  getCareersByPath = async (req, res, next) => {
    try {
      const careers = await this.getCareersByPathUC.execute(
        req.params.facultyId,
        req.params.academicLevelId,
        req.params.formationLevelId
      );
      res.json(careers);
    } catch (error) {
      next(error);
    }
  };

  getAllCareers = async (req, res, next) => {
    try {
      const careers = await this.getAllCareersUC.execute();
      if (careers.length === 0) {
        return res.status(404).json({ message: "No se encontraron carreras" });
      }
      res.status(200).json(careers);
    } catch (error) {
      console.error("Error al obtener carreras:", error);
      res.status(500).json({ error: "Error interno al obtener carreras" });
    }
  };

  getAllSubjects = async (req, res, next) => {
    try {
      const subjects = await this.getAllSubjectsUC.execute();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getCareerStructure = async (req, res, next) => {
    try {
      const structure = await this.getCareerStructureUC.execute(req.params.careerId);
      res.status(200).json(structure);
    } catch (error) {
      if (error.message === 'STRUCTURE_NOT_FOUND') {
        return res.status(404).json({ error: "No se encontró estructura para esta carrera" });
      }
      console.error("Error en careerStructure:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}

module.exports = AcademicController;
