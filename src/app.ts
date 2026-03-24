import express, { type Request, type Response, type NextFunction } from 'express';
import routes from './routes/index';
import cors from 'cors';
import passport from 'passport';
import './config/passport';

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use(routes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
