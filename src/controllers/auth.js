import config from 'config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';

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
        })
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

// TODO: activate email link - optional

export {
  signup,
  login
}
