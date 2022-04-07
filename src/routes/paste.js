import express from 'express';
import mongoose from 'mongoose';
import { check, validationResult } from 'express-validator';
import Paste from '../models/Paste';
import auth from '../middleware/auth';
import {
  createPaste,
  getAllPastesByUser,
  getPasteById,
  deletePasteById,
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
      check('expiresOn', 'expiredOn must be of number data type.')
        .optional()
        .isNumeric(),
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
 * @route         DELETE api/paste/:pasteid
 * @description   Delete paste by id
 * @access        Private
 */
router.delete('/:id', auth, deletePasteById);

/**
 * @route         GET api/paste/:pasteid/download
 * @description   Download paste by id
 * @access        Private
 */
router.get('/:id/download', downloadPasteById);

export default router;