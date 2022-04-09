import User from '../models/User';

const checkAccountActivation = (req, res, next) => {
  try {
    const user = User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'Invalid user id.'
        }
      });
    }

    if (!user.active) {
      return res.status(401).json({
        status: 'fail',
        data: {
          msg: 'Unactivated user account, authorization denied.'
        }
      });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      data: {
        msg: 'Invalid token, authorization denied.'
      }
    });
  }
}

module.exports = checkAccountActivation;
