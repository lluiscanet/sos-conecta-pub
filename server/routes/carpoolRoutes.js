import express from 'express';
import Carpool from '../models/Carpool.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create carpool
router.post('/', auth, async (req, res) => {
  try {
    const carpool = new Carpool(req.body);
    await carpool.save();
    res.status(201).json(carpool);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all carpools
router.get('/', async (req, res) => {
  try {
    const carpools = await Carpool.find();
    res.json(carpools);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete carpool
router.delete('/:id', auth, async (req, res) => {
  try {
    const carpool = await Carpool.findByIdAndDelete(req.params.id);
    if (!carpool) {
      return res.status(404).json({ error: 'Carpool not found' });
    }
    res.json({ message: 'Carpool deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Join carpool
router.post('/:id/join', auth, async (req, res) => {
  try {
    const carpool = await Carpool.findById(req.params.id);
    if (!carpool) {
      return res.status(404).json({ error: 'Carpool not found' });
    }
    if (carpool.currentPassengers.length >= carpool.maxPassengers) {
      throw new Error('Carpool is full');
    }
    carpool.currentPassengers.push(req.body.userId);
    if (carpool.currentPassengers.length >= carpool.maxPassengers) {
      carpool.status = 'full';
    }
    await carpool.save();
    res.json(carpool);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Leave carpool
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const carpool = await Carpool.findById(req.params.id);
    if (!carpool) {
      return res.status(404).json({ error: 'Carpool not found' });
    }
    carpool.currentPassengers = carpool.currentPassengers.filter(
      id => id !== req.body.userId
    );
    carpool.status = 'active';
    await carpool.save();
    res.json(carpool);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;