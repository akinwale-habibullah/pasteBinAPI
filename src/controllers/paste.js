import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import Paste from '../models/Paste';
import scheduleJob from '../utils/scheduler';

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
    console.error(err.message);
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
    console.error(err);

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
    if (paste.password && !password) {
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'Password is required'
        }
      })
    }

    if (paste.password &&
        paste.author.toString() !== req.user.id.toString() &&
        paste.password !== password) {
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'Invalid password.'
        }
      })
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
        if (err) return console.error(err);

        console.log('paste deleted due to burnAfterRead flag');
      });
    }
  } catch (err) {
    console.error(err);

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
      })
    }

    Paste.findOneAndRemove({_id: id}, (err, res) => {
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
    console.error(err);
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
    if (paste.password && !password) {
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'Password is required'
        }
      })
    }

    if (paste.password &&
        paste.author.toString() !== req.user.id.toString() &&
        paste.password !== password) {
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'Invalid password.'
        }
      })
    }

    // TODO: stream file to delete

    res.json({
      status: 'success',
      data: paste
    });
  } catch (err) {
    console.error(err);

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
  downloadPasteById
}
