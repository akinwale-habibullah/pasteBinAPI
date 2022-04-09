import express from 'express';
import moment from 'moment';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth';
import {
  createPaste,
  getAllPastesByUser,
  getPasteById,
  deletePasteById,
  updatePaste,
  downloadPasteById
} from '../controllers/paste'

const router = express.Router();

/**
 * @route         POST api/paste
 * @description   Create a new paste and return paste details
 * @access        Private
 */
router.post('/', [
    auth,
    [
      check('text', 'Text is required.')
        .not()
        .isEmpty(),
      check('password', 'Password must be of string data type.')
        .optional()
        .isString(),
      check('password', 'Password length must be between 6 and 30 characters.')
        .optional()
        .isLength({ min: 6, max: 30}),
      check('title', 'Title must be of String data type.')
        .optional()
        .isString(),
      check('burnAfterRead', 'burnAfterRead must be of Boolean data type.')
        .optional()
        .isBoolean(),
      check('expiresOn', 'expiresOn must be of number data type.')
        .optional()
        .isNumeric(),
      check('expiresOn')
        .optional()
        .custom((value) => {
          const intValue = parseInt(value);
          if (!moment(intValue).isValid()) {
            throw new Error('expiresOn must be valid UNIX timestamp.');
          } else {
            return value;
          }
        }),
      check('expiresOn')
        .optional()
        .custom((value) => {
          const intValue = parseInt(value);
          if (moment(intValue).isValid() && moment(intValue) < Date.now()) {
            throw new Error('expiresOn UNIX timestamp must be a future date.');
          } else {
            return value
          }
        })
    ]
  ],
  createPaste);

/**
 * @route         GET api/paste
 * @description   Get all pastes by logged in user
 * @access        Private
 */
router.get('/', auth, getAllPastesByUser);

/**
 * @route         GET api/paste/:pasteid
 * @description   Get paste by id
 * @access        Private
 */
router.get('/:id', auth, getPasteById);

/**
 * @route         PUT api/paste/:pasteid
 * @description   Update paste by id
 * @access        Private
 */
router.put('/:id', [
  auth,
  [
    check('text', 'Text must be a non empty string.')
      .optional()
      .isString()
      .not()
      .isEmpty(),
    check('password', 'Password must be of string data type.')
      .optional()
      .isString(),
    check('password', 'Password length must be between 6 and 30 characters.')
      .optional()
      .isLength({ min: 6, max: 30}),
    check('title', 'Title must be of String data type.')
      .optional()
      .isString(),
    check('burnAfterRead', 'burnAfterRead must be of Boolean data type.')
      .optional()
      .isBoolean(),
    check('expiresOn', 'expiresOn must be of number data type.')
      .optional()
      .isNumeric(),
    check('expiresOn')
      .optional()
      .custom((value) => {
        const intValue = parseInt(value);
        if (!moment(intValue).isValid()) {
          throw new Error('expiresOn must be valid UNIX timestamp.');
        } else {
          return value;
        }
      }),
    check('expiresOn')
      .optional()
      .custom((value) => {
        const intValue = parseInt(value);
        if (moment(intValue).isValid() && moment(intValue) < Date.now()) {
          throw new Error('expiresOn UNIX timestamp must be a future date.');
        } else {
          return value
        }
      })
  ]
], updatePaste);

/**
 * @route         DELETE api/paste/:pasteid
 * @description   Delete paste by id
 * @access        Private
 */
router.delete('/:id', auth, deletePasteById);

/**
 * @route         GET api/paste/:id/download
 * @description   Get paste as raw txt
 * @access        Private
 */
router.get('/:id/download', downloadPasteById);

export default router;
