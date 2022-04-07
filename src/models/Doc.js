import mongoose from 'mongoose';

const docSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Doc', docSchema);
