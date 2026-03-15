class EventController {
  constructor(useCases) {
    this.getEventsUC = useCases.getEvents;
  }

  getEvents = async (req, res) => {
    try {
      const events = await this.getEventsUC.execute();
      res.status(200).json(events);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      res.status(500).json({ error: "Error interno del servidor al cargar eventos" });
    }
  };
}

module.exports = EventController;
