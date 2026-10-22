const Activity = require('../models/Activity');

// Obtener todas las actividades
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('responsable')
      .populate('participantes');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una actividad específica
exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('responsable')
      .populate('participantes');
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una nueva actividad
exports.createActivity = async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate('responsable')
      .populate('participantes');
    
    res.status(201).json(populatedActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar una actividad
exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }
    
    Object.assign(activity, req.body);
    await activity.save();
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate('responsable')
      .populate('participantes');
    
    res.json(populatedActivity); 
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar una actividad
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }
    
    await Activity.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Actividad eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};