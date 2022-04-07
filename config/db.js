const mongoose = require('mongoose');
const config = require('config');

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

module.exports = connectedDB;
