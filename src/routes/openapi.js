import { Router } from 'express';
import { getAPIDoc, getDocs } from '../controllers/openapi';

const router = Router();

router.get('/docs', getDocs);

router.get('/', getAPIDoc);

export default router;
