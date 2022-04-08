import schedule from 'node-schedule';
import Paste from '../models/Paste';

const scheduleJob = (date, id) => {
  schedule.scheduleJob(
    date, () => dropPaste(id)
  );
};

const dropPaste = async (id) => {
  try {
    Paste.findOneAndRemove({_id: id}, (err, res) => {
      if (err) {
        return console.error(err)
      }

      return;
    });
  } catch (err) {
    console.error(err);
  }
};

export default scheduleJob;