import path from 'path';
import fs from 'fs';
import logger from './logger';


const createDirectory = async (dirPath) => {
  // check if folder exists and create it if not
  if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, (err) => {
        if (err) {
          logger.error(`createDirectory error: ${err}`);
          return;
        }
  
        logger.info(`createDirectory: ${dirPath} folder successfully created.`);
        return;
      });
  } else {
    logger.info(`createDirectory: No need to create ${dirPath} folder, as it already exists.`);
  }
};

const createFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        logger.error(`_createFil error: ${err}`)
        return reject(err);
      }
  
      logger.info(`_createFile: Temp paste file ${filePath} successfully created.`);
      return resolve();
    });
  });
};

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(err);
        return reject(err);
      }
  
      logger.info(`_deleteFile: Temp paste file ${filePath} successfully deleted`);
      return resolve();
    });
  });
};

export {
  createDirectory,
  createFile,
  deleteFile
}
