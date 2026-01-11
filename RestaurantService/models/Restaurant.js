import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  workingHours: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  cuisine: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  preparationTime: {
    type: String,
    default: '30 min'
  },
  imageUrl: {
    type: String,
    trim: true
  },
  deliveryFee: {
    type: Number,
    default: 2.50
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;