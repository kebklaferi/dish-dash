import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  logLevel: { type: String, required: true },
  url: { type: String, required: true },
  correlationId: { type: String, required: true },
  serviceName: { type: String, required: true },
  message: { type: String, required: true },
  fullLog: { type: String, required: true }
}, { timestamps: true });

logSchema.index({ timestamp: 1 });
logSchema.index({ correlationId: 1 });

export default mongoose.model('Log', logSchema);