import fs from 'fs';
import path, { resolve } from 'path';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import Paste from '../models/Paste';
import scheduleJob from '../utils/scheduler';
import logger from '../utils/logger';
import {
  createFile,
  deleteFile
} from '../utils/filesystem';

const createPaste = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      data: errors.array()
    });
  }

  try {
    const { text, password, title, burnAfterRead, expiresOn } = req.body;
    const newPaste = {
      author: req.user.id,
      text
    };
    if (password) {
      newPaste['password'] = password;
    }
    if (title) {
      newPaste['title'] = title;
    }
    if (burnAfterRead) {
      newPaste['burnAfterRead'] = burnAfterRead;
    }
    if (expiresOn) {
      newPaste['expiresOn'] = expiresOn;
    }

    const paste = new Paste(newPaste);
    await paste.save();

    if (expiresOn) {
        scheduleJob(new Date(expiresOn), paste.id);
    }

    res.json({
      status: 'success',
      data: {
        pasteURL: `http://${req.get('host')}/api/paste/${paste.id}`
      }
    })
  } catch (err) {
    logger.error(`createPaste error - ${err}`);
    res.status(500).send('Server error');
  }
};

const getAllPastesByUser = async (req, res) => {
  const { id } = req.user;

  try {
    const query = {
      author: mongoose.mongo.ObjectId(id)
    };
    const pastes = await Paste.find(query).lean();

    res.json({
      status: 'success',
      data: pastes
    });
  } catch (err) {
    logger.error(`getAllPastesByUser error: ${err}`);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'fail',
        data: {
          msg: 'Paste not found'
        }
      });
    }

    res.status(500).json({
      status: 'error',
      error:  'Server error'
    });
  }
};

const getPasteById = async (req, res) => {
  const { id } = req.params;

  try {
    const paste = await Paste.findById(id)
      .populate('author', ['name', '_id'])
      .lean();

    if (!paste) {
      return res.status(404).json({
        status: 'fail',
        data: {
          msg: 'Paste not found'
        }
      });
    }

    const { password } = req.query;
    // check if paste has password and user is not author    
    if (paste.password &&
      paste.author.toString() !== req.user.id.toString()) {
          if (!password) {
            return res.status(401).json({
              status: 'fail',
              data: {
                msg: 'Password is required'
              }
            })
          }
          
          if (paste.password !== password) {
            return res.status(401).json({
              status: 'fail',
              data: {
                msg: 'Invalid password.'
              }
            })
          }
    }

    res.json({
      status: 'success',
      data: paste
    });

    // check if burnAfterRead and not author
    if (paste.burnAfterRead && 
      req.user.id.toString() !== paste.author.toString()
    ) {
      Paste.findOneAndDelete({
        _id: id
      }, (err, doc) => {
        if (err) return logger.error(`getPasteById - Paste.findOneAndDelete error: ${id} - ${err}`);

        logger.info(`getPasteById - Paste.findOneAndDelete: ${id} deleted due to burnAfterRead flag`);
      });
    }
  } catch (err) {
    logger.error(`getPasteId error - ${err}`);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'fail',
        data: {
          msg: 'Paste not found'
        }
      });
    }

    res.status(500).json({
      status: 'error',
      error:  'Server error'
    });
  }
};

const deletePasteById = async (req, res) => {
  const { id } = req.params;

  try {
    const paste = await Paste.findById(id);

    if (!paste) {
      return res.status(404).json({
        status: 'fail',
        data: {
          msg: 'Paste not found'
        }
      });
    }

    // check user is paste author
    if (req.user.id.toString() !== paste.author.toString()) {
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'A paste can only be deleted by its author.'
        }
      });
    }

    Paste.findOneAndRemove({_id: id}, (err, doc) => {
      if (err) {
        throw err
      } else {
        res.json({
          status: 'success',
          data: {
            msg: 'Paste deleted'
          }
        });
      }
    });

  } catch (err) {
    logger.error(`$deletePasteById error - ${err}`);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'fail',
        data: {
          msg: 'Paste not found'
        }
      });
    }
    res.status(500).json({
      status: 'error',
      error:  'Server error'
    });
  }
};

const updatePaste = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      data: errors.array()
    });
  }

  const { id } = req.params;
  try {
    const paste = Paste.findById(id);

    if (!paste) {
      return res.status(404).json({
        status: 'fail',
        data: {
          msg: 'Paste not found'
        }
      });
    }

    // check user is paste author
    if (req.user.id.toString() !== paste.author.toString()) {
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'A paste can only be updated by its author.'
        }
      });
    }

    const { text, password, title, burnAfterRead, expiresOn } = req.body;
    if (text) {
      paste.text = text;
    }
    if (password) {
      paste['password'] = password;
    }
    if (title) {
      paste['title'] = title;
    }
    if (burnAfterRead) {
      paste['burnAfterRead'] = burnAfterRead;
    }
    if (expiresOn) {
      paste['expiresOn'] = expiresOn;
    }

    await paste.save();

    if (expiresOn) {
      scheduleJob(new Date(expiresOn), paste.id);
    }

    res.json({
      status: 'success',
      data: paste
    });
  } catch (err) {
    logger.error(`updatePaste error - ${err}`);
    res.status(500).send('Server error');
  }
};

const downloadPasteById = async (req, res) => {
  const { id } = req.params;

  try {
    const paste = await Paste.findById(id).lean();

    if (!paste) {
      return res.status(404).json({
        status: 'fail',
        data: {
          msg: 'Paste not found'
        }
      });
    }

    const { password } = req.query;
    // check if paste has password and user is not author    
    if (paste.password &&
      paste.author.toString() !== req.user.id.toString()) {
          if (!password) {
            return res.status(401).json({
              status: 'fail',
              data: {
                msg: 'Password is required'
              }
            })
          }
          
          if (paste.password !== password) {
            return res.status(401).json({
              status: 'fail',
              data: {
                msg: 'Invalid password.'
              }
            })
          }
    }

    // return file
    const filePath = path.join(process.cwd(), 'files', `temp${Math.floor(Math.random() * (1000000 - 1) + 1)}.txt`);

    // check if folder exists and create it if not
    await createFile(filePath, paste.text);

    await new Promise((resolve, reject) => {
      res.sendFile(filePath, (err) => {
        if (err) {
          logger.error(`downloadPasteById error - res.sendFile - ${err}`);
          return reject(err);
        }

        return resolve();
      });
    });

    await deleteFile(filePath);

    // check if burnAfterRead and not author
    if (paste.burnAfterRead && 
      req.user.id.toString() !== paste.author.toString()
    ) {
      Paste.findOneAndDelete({
        _id: id
      }, (err, doc) => {
        if (err) return logger.error(`downloadPasteById - burnAfterRead - ${err}`);

        logger.info('downloadPasteById - Paste deleted due to burnAfterRead flag.');
      });
    }
  } catch (err) {
    logger.error(`downloadPasteById error - ${err}`);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'fail',
        data: {
          msg: 'Paste not found'
        }
      });
    }

    res.status(500).json({
      status: 'error',
      error:  'Server error'
    });
  }
};

export {
  createPaste,
  getAllPastesByUser,
  getPasteById,
  deletePasteById,
  updatePaste,
  downloadPasteById
}
