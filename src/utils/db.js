import mongoose from 'mongoose';
import config from 'config';
import logger from './logger';

const mongoURI = config.get('mongoURI');

const connectedDB = async () => {
  try {
    await mongoose.connect(mongoURI, {});
    logger.info('connectDB - MongoDB connected');
  } catch (error) {
    logger.error(`connectDB error -${error}`);
    process.exit(1);
  }
}

export default connectedDB;
