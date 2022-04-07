import config from 'config';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';

const User = require('../models/User');

const router = express.Router();

/**
 * @route         POST api/auth
 * @description   Register user
 * @access        Public
 */
router.post('/', [
  check('name', 'Name is required.')
    .not()
    .isEmpty(),
  check('name', 'Name must string data type.')
    .isString(),
  check('name', 'Name must be 5 or more characters.')
    .isLength({ min: 5, max: 40}),
  check('email', 'Invalid email')
    .isEmail(),
  check('password', 'Password must be 6 or more characters.')
    .isLength({ min: 6, max: 30})
], async (req, res) => {
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
      { expiresIn: '360000' },
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
    res.status(500).send('Server error');
  }
});

/**
 * @route         POST api/auth/signin
 * @description   Authenticate user and get token
 * @access        Public
 */
router.post('/login', [
  check('email', 'Invalid email.')
    .isEmail(),
  check('password', 'Password is required.')
    .exists(),
  check('password', 'Password must be 6 or more characters.')
    .isLength({ min: 6, max: 30})
], async (req, res) => {
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
      { expiresIn: '360000' },
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
    res.status(500).send('Server error');
  }
});

export default router;