require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const passport = require('passport');

// --- INICIALIZACIÓN DE FIREBASE ---
const { db } = require('./src/config/firestore');


// --- REPOSITORIOS (Infraestructura/Database) ---
const FirestoreUserRepository = require('./src/infrastructure/database/FirestoreUserRepository');
const FirestoreGroupRepository = require('./src/infrastructure/database/FirestoreGroupRepository');
const FirestoreGroupMemberRepository = require('./src/infrastructure/database/FirestoreGroupMemberRepository');
const FirestoreGroupRequestRepository = require('./src/infrastructure/database/FirestoreGroupRequestRepository');
const FirestoreChatRepository = require('./src/infrastructure/database/FirestoreChatRepository');
const FirestoreMessageRepository = require('./src/infrastructure/database/FirestoreMessageRepository');
const FirestoreAcademicProfileRepository = require('./src/infrastructure/database/FirestoreAcademicProfileRepository');
const FirestoreAcademicCatalogRepository = require('./src/infrastructure/database/FirestoreAcademicCatalogRepository');
const FirestoreEventRepository = require('./src/infrastructure/database/FirestoreEventRepository');

const userRepo = new FirestoreUserRepository(db);
const groupRepo = new FirestoreGroupRepository(db);
const groupMemberRepo = new FirestoreGroupMemberRepository(db);
const groupRequestRepo = new FirestoreGroupRequestRepository(db);
const chatRepo = new FirestoreChatRepository(db);
const messageRepo = new FirestoreMessageRepository(db);
const academicProfileRepo = new FirestoreAcademicProfileRepository(db);
const catalogRepo = new FirestoreAcademicCatalogRepository(db);
const eventRepo = new FirestoreEventRepository(db);

// --- SERVICIOS EXTERNOS ---
const CloudinaryService = require('./src/infrastructure/external/CloudinaryService');
const cloudinaryService = new CloudinaryService({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET
});

// --- CONFIGURACIÓN DE PASSPORT ---
const configurePassport = require('./src/config/passport');
configurePassport(userRepo);

// --- USE-CASES (Aplicación) ---

// Group use-cases
const CreateGroup = require('./src/application/use-cases/group/createGroup');
const GetUserGroups = require('./src/application/use-cases/group/getUserGroups');
const GetGroupById = require('./src/application/use-cases/group/getGroupById');
const SearchGroups = require('./src/application/use-cases/group/searchGroups');
const CheckGroupNameUnique = require('./src/application/use-cases/group/checkGroupNameUnique');
const SendJoinRequest = require('./src/application/use-cases/group/sendJoinRequest');
const GetGroupRequests = require('./src/application/use-cases/group/getGroupRequests');
const HandleRequestAction = require('./src/application/use-cases/group/handleRequestAction');
const RemoveMember = require('./src/application/use-cases/group/removeMember');
const TransferAdmin = require('./src/application/use-cases/group/transferAdmin');
const AddMember = require('./src/application/use-cases/group/addMember');
const LeaveGroup = require('./src/application/use-cases/group/leaveGroup');
const GetAvailableStudents = require('./src/application/use-cases/group/getAvailableStudents');
const DeleteUserRequests = require('./src/application/use-cases/group/deleteUserRequests');

// Chat use-cases
const GetOrCreateChat = require('./src/application/use-cases/chat/getOrCreateChat');
const SendMessage = require('./src/application/use-cases/chat/sendMessage');
const SendFileMessage = require('./src/application/use-cases/chat/sendFileMessage');
const GetMessages = require('./src/application/use-cases/chat/getMessages');

// Profile use-cases
const GetFullProfile = require('./src/application/use-cases/profile/getFullProfile');
const SaveAcademicProfile = require('./src/application/use-cases/profile/saveAcademicProfile');

// Search use-cases
const SearchStudents = require('./src/application/use-cases/search/searchStudents');

// Event use-cases
const GetEvents = require('./src/application/use-cases/event/getEvents');

// Academic use-cases
const GetAllFaculties = require('./src/application/use-cases/academic/getAllFaculties');
const GetAcademicLevelsByFaculty = require('./src/application/use-cases/academic/getAcademicLevelsByFaculty');
const GetFormationLevels = require('./src/application/use-cases/academic/getFormationLevels');
const GetCareersByPath = require('./src/application/use-cases/academic/getCareersByPath');
const GetAllCareers = require('./src/application/use-cases/academic/getAllCareers');
const GetAllSubjects = require('./src/application/use-cases/academic/getAllSubjects');
const GetCareerStructure = require('./src/application/use-cases/academic/getCareerStructure');

// Instanciar use-cases con dependencias inyectadas
const createGroupUC = new CreateGroup(groupRepo, groupMemberRepo);
const getUserGroupsUC = new GetUserGroups(groupMemberRepo, groupRepo, catalogRepo, userRepo);
const getGroupByIdUC = new GetGroupById(groupRepo, groupMemberRepo, catalogRepo, userRepo);
const searchGroupsUC = new SearchGroups(groupRepo, groupMemberRepo, catalogRepo, userRepo);
const checkGroupNameUniqueUC = new CheckGroupNameUnique(groupRepo);
const sendJoinRequestUC = new SendJoinRequest(groupRepo, groupMemberRepo, groupRequestRepo);
const getGroupRequestsUC = new GetGroupRequests(groupRequestRepo);
const handleRequestActionUC = new HandleRequestAction(groupMemberRepo, groupRequestRepo);
const removeMemberUC = new RemoveMember(groupMemberRepo);
const transferAdminUC = new TransferAdmin(groupRepo, groupMemberRepo, db);
const addMemberUC = new AddMember(groupMemberRepo);
const leaveGroupUC = new LeaveGroup(groupMemberRepo);
const getAvailableStudentsUC = new GetAvailableStudents(groupMemberRepo, userRepo);

const getOrCreateChatUC = new GetOrCreateChat(chatRepo);
const sendMessageUC = new SendMessage(messageRepo, chatRepo);
const sendFileMessageUC = new SendFileMessage(cloudinaryService, sendMessageUC);
const getMessagesUC = new GetMessages(messageRepo);

const getFullProfileUC = new GetFullProfile(academicProfileRepo, userRepo, catalogRepo);
const saveAcademicProfileUC = new SaveAcademicProfile(academicProfileRepo, userRepo, catalogRepo, getFullProfileUC);

const searchStudentsUC = new SearchStudents(academicProfileRepo, userRepo);

const getEventsUC = new GetEvents(eventRepo);

const getAllFacultiesUC = new GetAllFaculties(catalogRepo);
const getAcademicLevelsByFacultyUC = new GetAcademicLevelsByFaculty(catalogRepo);
const getFormationLevelsUC = new GetFormationLevels(catalogRepo);
const getCareersByPathUC = new GetCareersByPath(catalogRepo);
const getAllCareersUC = new GetAllCareers(catalogRepo);
const getAllSubjectsUC = new GetAllSubjects(catalogRepo);
const getCareerStructureUC = new GetCareerStructure(catalogRepo);
const deleteUserRequestsUC = new DeleteUserRequests(groupRequestRepo);

// --- CONTROLLERS (Infraestructura/HTTP) ---
const GroupController = require('./src/infrastructure/http/controllers/groupController');
const ChatController = require('./src/infrastructure/http/controllers/chatController');
const ProfileController = require('./src/infrastructure/http/controllers/profileController');
const SearchController = require('./src/infrastructure/http/controllers/searchController');
const EventController = require('./src/infrastructure/http/controllers/eventController');
const AcademicController = require('./src/infrastructure/http/controllers/academicController');


const groupCtrl = new GroupController({
  createGroup: createGroupUC,
  getUserGroups: getUserGroupsUC,
  getGroupById: getGroupByIdUC,
  searchGroups: searchGroupsUC,
  checkGroupNameUnique: checkGroupNameUniqueUC,
  sendJoinRequest: sendJoinRequestUC,
  getGroupRequests: getGroupRequestsUC,
  handleRequestAction: handleRequestActionUC,
  removeMember: removeMemberUC,
  transferAdmin: transferAdminUC,
  addMember: addMemberUC,
  leaveGroup: leaveGroupUC,
  getAvailableStudents: getAvailableStudentsUC
});

const chatCtrl = new ChatController({
  getOrCreateChat: getOrCreateChatUC,
  sendMessage: sendMessageUC,
  sendFileMessage: sendFileMessageUC,
  getMessages: getMessagesUC
});

const profileCtrl = new ProfileController({
  getFullProfile: getFullProfileUC,
  saveAcademicProfile: saveAcademicProfileUC
});

const searchCtrl = new SearchController({
  searchStudents: searchStudentsUC
});

const eventCtrl = new EventController({
  getEvents: getEventsUC
});

const academicCtrl = new AcademicController({
  getAllFaculties: getAllFacultiesUC,
  getAcademicLevelsByFaculty: getAcademicLevelsByFacultyUC,
  getFormationLevels: getFormationLevelsUC,
  getCareersByPath: getCareersByPathUC,
  getAllCareers: getAllCareersUC,
  getAllSubjects: getAllSubjectsUC,
  getCareerStructure: getCareerStructureUC
});

// --- RUTAS (Infraestructura/HTTP) ---
const createGroupRoutes = require('./src/infrastructure/http/routes/groupRoutes');
const createChatRoutes = require('./src/infrastructure/http/routes/chatRoutes');
const createProfileRoutes = require('./src/infrastructure/http/routes/profileRoutes');
const createSearchRoutes = require('./src/infrastructure/http/routes/searchRoutes');
const createEventRoutes = require('./src/infrastructure/http/routes/eventRoutes');
const createAcademicRoutes = require('./src/infrastructure/http/routes/academicRoutes');
const createAuthRoutes = require('./src/infrastructure/http/routes/authRoutes');

const { globalErrorHandler } = require('./src/infrastructure/http/middlewares/errorMiddleware');

// --- APLICACIÓN EXPRESS ---
const app = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// --- DEFINICIÓN DE RUTAS ---

// Rutas de Autenticación
app.use('/auth', createAuthRoutes());

// Rutas de la API (Prefijo /api)
app.use('/api/academic-profile', createProfileRoutes(profileCtrl));
app.use('/api/chat', createChatRoutes(chatCtrl));
app.use('/api/search-students', createSearchRoutes(searchCtrl));
app.use('/api/groups', createGroupRoutes(groupCtrl));
app.use('/api', createEventRoutes(eventCtrl));
app.use('/api', createAcademicRoutes(academicCtrl));

// --- MANEJO DE ERRORES ---
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor UniConnect listo en puerto ${PORT}`));