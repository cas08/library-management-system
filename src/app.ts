import express, { type Request, type Response } from 'express';
import path from 'node:path';
import routes from './routes/index';
import cors from 'cors';
import passport from 'passport';
import './config/passport';
import { errorHandler } from './middleware/error.middleware';

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/uploads', express.static(path.resolve(process.cwd(), 'src/uploads')));

app.use(routes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
