import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import roomRouter from './routes/roomRoutes';

const app: Express = express();

app.use(morgan('dev'));
app.use(express.json());

app.use(
    cors({
        origin: process.env.CORS_ORIGIN ?? true,
        methods: ['GET'],
        allowedHeaders: ['Origin', 'X-Request-With', 'Content-Type', 'Accept', 'Authorization'],
    }),
);

app.use('/room', roomRouter);

export default app;