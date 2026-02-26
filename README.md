# UniConnect - Backend API

Esta es la API robusta de **UniConnect**, encargada de la lógica de negocio, la persistencia de datos en Firebase Firestore y la integración de perfiles académicos.



## Tecnologías

* **Entorno de ejecución:** [Node.js](https://nodejs.org/) (v18+).
* **Framework Web:** [Express.js](https://expressjs.com/).
* **Base de Datos:** [Google Firebase Firestore](https://firebase.google.com/docs/firestore).
* **SDK de Administración:** Firebase Admin SDK.
* **Middleware:** CORS, JSON Body Parser.

---

## Requisitos Previos

* Node.js instalado.
* Un proyecto creado en [Firebase Console](https://console.firebase.google.com/).
* Una cuenta de servicio de Firebase (archivo `.json`).

---

## Instalación y Configuración

1. **Clona el repositorio:**
   ```bash
   git clone [https://github.com/mel30101/uniconnect_g3-backend.git]
   cd uniconnect-backend

2. **Instalar dependencias**
    npm install

3. **Variables de entorno**
    GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET=
    PORT=3000
    BASE_URL=del backend

4. **Iniciar API**
    node index.js


## Estructura de la Base de Datos (Firestore)
    La API interactúa con las siguientes colecciones:
        users: Almacena datos básicos de identidad (nombre, correo, UID).
        academic_profiles: Contiene la relación de carreras, materias (IDs) y estado de monitoría.
        careers: Diccionario de nombres de carreras profesionales.
        subjects: Diccionario de nombres de asignaturas académicas.

## Endpoints Principales
    Perfiles Académicos
        GET /api/academic-profile/:studentId: Obtiene el perfil completo. Realiza un "join" lógico para devolver nombres de materias y carreras en lugar de IDs.

        POST /api/academic-profile: Crea o actualiza el perfil académico de un estudiante.

    Búsqueda y Filtros
        GET /api/search-students: Permite buscar estudiantes.
        Params: name (string), subjectId (string), onlyMonitors (boolean).