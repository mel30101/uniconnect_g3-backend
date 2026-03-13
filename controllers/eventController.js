const admin = require('firebase-admin');

const db = admin.firestore();

const getEvents = async (req, res) => {
    try {
        const eventsSnapshot = await db.collection('events').get();
        const events = [];
        
        eventsSnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(events);
    } catch (error) {
        console.error("Error al obtener eventos:", error);
        res.status(500).json({ error: "Error interno del servidor al cargar eventos" });
    }
};

module.exports = { getEvents };