import express from 'express';
import { check } from 'express-validator';
import {
  signup,
  login,
  activateAccount
} from '../controllers/auth';

const router = express.Router();

/**
 * @route         POST api/auth
 * @description   Register user and return token
 * @access        Public
 */
// TODO: validate email to match domain in config
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
], signup);

/**
 * @route         POST api/auth/signin
 * @description   Authenticate user and return token
 * @access        Public
 */
router.post('/login', [
  check('email', 'Invalid email.')
    .isEmail(),
  check('password', 'Password is required.')
    .exists(),
  check('password', 'Password must be 6 or more characters.')
    .isLength({ min: 6, max: 30})
], login);

/**
 * @route         PUT api/auth/activate/:token
 * @description   Activate 
 * @access        Public
 */
router.get('/activate/:token', activateAccount);

export default router;
