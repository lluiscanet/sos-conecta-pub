import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  address: String,
  radius: Number
}, { _id: false });

const volunteerSkillSchema = new mongoose.Schema({
  category: String,
  subcategories: [String],
  hasExperience: Boolean
}, { _id: false });

const assistanceRequestSchema = new mongoose.Schema({
  category: String,
  subcategories: [String],
  description: String,
  urgency: String,
  createdAt: String
}, { _id: false });

const temporaryHousingSchema = new mongoose.Schema({
  id: String,
  address: String,
  location: locationSchema,
  startDate: String,
  endDate: String,
  maxOccupancy: Number,
  isShared: Boolean,
  description: String,
  status: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String, 
    unique: true,
    sparse: true // Allows null/undefined values
  },
  password: String,
  phone: String,
  roles: [String],
  location: locationSchema,
  skills: [volunteerSkillSchema],
  assistanceRequests: [assistanceRequestSchema],
  temporaryHousing: [temporaryHousingSchema],
  hasAccount: Boolean
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  strict: false // Allows flexible schema for future extensions
});

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Index for searching users by role
userSchema.index({ roles: 1 });

// Index for email searches
userSchema.index({ email: 1 });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);