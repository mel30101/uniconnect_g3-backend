const express = require('express');

function createEventRoutes(controller) {
  const router = express.Router();

  router.get('/events', controller.getEvents);

  return router;
}

module.exports = createEventRoutes;
