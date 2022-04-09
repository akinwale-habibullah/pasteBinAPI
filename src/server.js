import path from 'path';
import express from 'express';
import connectedDB from './utils/db';
import authRouter from './routes/auth';
import pasteRouter from './routes/paste';
import openAPIRoutes from './routes/openapi';
import { createDirectory } from './utils/filesystem';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 4000;

// connect mongo database
connectedDB();

// create files folder
const logFolderPath = path.join(process.cwd(), 'files');
createDirectory(logFolderPath);

// init middleware
app.use(express.json({
  extended: false
}));

// define routes
app.use('/api/auth', authRouter);
app.use('/api/paste', pasteRouter);
app.use('/api-docs', openAPIRoutes);
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(PORT, () => logger.info(`Server listening on port: ${PORT}.`));

export default app;
