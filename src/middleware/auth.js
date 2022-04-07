import jwt from 'jsonwebtoken';
import config from 'config';

const auth = (req, res, next) => {
  // Get token from header
  let token = req.header('Authorization');

  // check if no token
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      data: {
        msg: 'No token, authorization denied.'
      }
    });
  }
  token = token.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
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

module.exports = auth;
