import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import router from './routes';
import questionRouter from './routes/questionRoutes';
import bodyParser from 'body-parser';

const app: Express = express();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
    cors({
        origin: process.env.CORS_ORIGIN ?? true,
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
        allowedHeaders: ['Origin', 'X-Request-With', 'Content-Type', 'Accept', 'Authorization'],
    }),
);

// Routes
app.use('/', router);
app.use('/questions', questionRouter);

export default app;
