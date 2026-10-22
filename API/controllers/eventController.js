const Event = require('../models/Event');

// Obtener todos los eventos
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizador')
      .populate('participantes.usuario');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un evento específico
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizador')
      .populate('participantes.usuario');
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo evento
exports.createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    
    // Corregido: usar populate en una sola llamada
    const populatedEvent = await Event.findById(event._id)
      .populate('organizador')
      .populate('participantes.usuario');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar un evento
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    const populatedEvent = await Event.findById(event._id)
      .populate('organizador')
      .populate('participantes.usuario');
    
    res.json(populatedEvent);
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar estado de participante
exports.updateParticipantStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    const participante = event.participantes.find(
      p => p.usuario.toString() === req.params.userId
    );
    
    if (!participante) {
      return res.status(404).json({ message: 'Participante no encontrado en el evento' });
    }
    
    participante.confirmacion = req.body.confirmacion;
    await event.save();
    
    // Corregido: usar populate en una sola llamada
    const populatedEvent = await Event.findById(event._id)
      .populate('organizador')
      .populate('participantes.usuario');
    
    // Eliminada la emisión de eventos por socket
    
    res.json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un evento
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    res.json({ message: 'Evento eliminado', success: true });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ message: error.message, success: false });
  }
};