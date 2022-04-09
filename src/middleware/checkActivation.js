import { validationResult } from 'express-validator';
import User from '../models/User';
import logger from '../utils/logger';

const checkAccountActivation = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        data: errors.array()
      });
    }

    const { email } = req.body;

    const user = User.findOne({email: email}).lean();

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'Invalid login credentials.'
        }
      });
    }

    // check if active
    if (!user.active) {
      logger.info(`checkAccountActivation - user not active - ${email}`);
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'Unactivated user account, authorization denied.'
        }
      });
    }

    req.user = user;
    
    next();
  } catch (err) {
    logger.error(`checkAccountActivation - error - ${err}`);
    return res.status(500).json({
      status: 'error',
      data: {
        msg: 'Server error.'
      }
    });
  }
}

module.exports = checkAccountActivation;
