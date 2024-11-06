import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import router from './routes';
import historyRouter from './routes/historyRoutes';
import bodyParser from 'body-parser';
import config from './config';
import { verifyAccessToken } from './middleware/jwt';

const app: Express = express();

// Middleware
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
    cors({
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
        allowedHeaders: ['Origin', 'X-Request-With', 'Content-Type', 'Accept', 'Authorization'],
    }),
);

// Routes
app.use('/', router);
app.use('/api/history/history', verifyAccessToken, historyRouter);

export default app;
