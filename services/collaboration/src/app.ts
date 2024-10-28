import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import roomRouter from './routes/roomRoutes';
import bodyParser from 'body-parser';
import router from './routes';
import config from './config';

const app: Express = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.url}`);
    next();
});

app.use(
    cors({
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'PATCH'],
        allowedHeaders: ['Origin', 'X-Request-With', 'Content-Type', 'Accept', 'Authorization'],
    }),
);

app.use('/', router);
app.use('/room', roomRouter);

export default app;
