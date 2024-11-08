import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  address: String
}, { _id: false });

const carpoolSchema = new mongoose.Schema({
  driverId: {
    type: String,
    required: true,
    index: true
  },
  origin: {
    type: locationSchema,
    required: true
  },
  destination: {
    type: locationSchema,
    required: true
  },
  departureTime: {
    type: String,
    required: true,
    index: true
  },
  maxPassengers: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  currentPassengers: {
    type: [String],
    default: []
  },
  description: String,
  status: {
    type: String,
    enum: ['active', 'full', 'cancelled', 'completed'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  strict: false
});

// Compound index for searching carpools by status and departure time
carpoolSchema.index({ status: 1, departureTime: 1 });

// Index for geospatial queries on origin and destination
carpoolSchema.index({ 'origin.coordinates': '2dsphere' });
carpoolSchema.index({ 'destination.coordinates': '2dsphere' });

export default mongoose.model('Carpool', carpoolSchema);