import schedule from 'node-schedule';
import Paste from '../models/Paste';
import logger from './logger';

const scheduleJob = (date, id) => {
  schedule.scheduleJob(
    date, () => dropPaste(id)
  );
};

const dropPaste = async (id) => {
  try {
    Paste.findOneAndRemove({_id: id}, (err, res) => {
      if (err) {
        return logger.error(`scheduler - dropPaste - Paste.findOneAndRemove - error - ${err}`)
      }

      return;
    });
  } catch (err) {
    logger.error(`scheduler - dropPaste - error - ${err}`);
  }
};

export default scheduleJob;