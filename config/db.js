import mongoose from 'mongoose';
import config from 'config';

const mongoURI = config.get('mongoURI');

const connectedDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

export default connectedDB;
