import mongoose from 'mongoose';

const pasteSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String
  },
  text: {
    type: String,
    required: true
  },
  expiresOn: {
    type: String
  },
  password: {
    type: String,
  },
  burnAfterRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true 
});

export default mongoose.model('Paste', pasteSchema);
