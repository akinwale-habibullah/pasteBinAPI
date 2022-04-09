import config from 'config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import sendActivationEmail from '../utils/email';

const signup =  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      data: errors.array()
    });
  }

  const { name, email, password }  = req.body;

  try {
    // check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        status: 'fail',
        data: [
          { msg: 'A user with this email already exists.'}
        ]
      });
    }

    user = new User({
      name,
      email,
      password
    });
    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    }
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '6h' },
      (err, token) => {
        if (err) throw err;

        res.json({
          status: 'success',
          data: token
        });
      }
    );

    // create activation token and send email
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '1d'},
      (err, token) => {
        if (err) throw err;

        user.token = token;
        user.save();
        sendActivationEmail(user.name, user.email, `http://${req.get('host')}/api/auth/activate/${token}`);
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'error',
      error: 'Server error'
    });
  }
};

const login =  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      data: errors.array()
    });
  }

  const { email, password }  = req.body;

  try {
    // check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        data: [
          { msg: 'Invalid credentials'}
        ]
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'fail',
        data: [
          { msg: 'Invalid credentials' }
        ]
      });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '6h' },
      (err, token) => {
        if (err) throw err;

        res.json({
          status: 'success',
          data: token
        })
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'error',
      'error': 'Server error'
    });
  }
};

const activateAccount = async (req, res) => {
  const {token} = req.params;

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    const {id} = decoded.user;

    const user = await User.findById(id);

    // TODO: we should return a well designed INVALID ACTIVATION HTML page.
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        data: {
          msg: 'Invalid account activation link.'
        }
      });
    }
    // TODO: we should return a well designed INVALID ACTIVATION HTML page.
    if (user.token !== token) {
      return res.json({
        status: 'fail',
        data: {
          msg: 'Invalid account activation link.'
        }
      })
    }
    user.active = true;
    user.token = '';
    user.save();

    res.json({
      status: 'success',
      data: {
        msg: 'User account active.'
      }
    })
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      data: {
        msg: 'Invalid token, authorization denied.'
      }
    });
  }
}


export {
  signup,
  login,
  activateAccount
}
