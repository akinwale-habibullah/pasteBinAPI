import express from 'express';
import connectedDB from '../config/db';
import authRouter from './routes/auth';
import pasteRouter from './routes/paste';

const app = express();
const PORT = process.env.PORT || 4000;

// connect mongo database
connectedDB();

// init middleware
app.use(express.json({
  extended: false
}));

// define routes
app.use('/api/auth', authRouter);
app.use('/api/paste', pasteRouter);


app.listen(PORT, () => console.log(`Server listening on port: ${PORT}.`));

export default app;
