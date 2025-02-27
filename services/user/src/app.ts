import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import userRoutes from './routes/user-routes';
import authRoutes from './routes/auth-routes';

const app = express();

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options('*', cors());

// To handle CORS Errors
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*'); // "*" -> Allow all links to access

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Browsers usually send this before PUT or POST Requests
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH');
        res.status(200).json({});
        return;
    }

    // Continue Route Processing
    next();
});

app.use('/api/user/users', userRoutes);
app.use('/api/user/auth', authRoutes);

app.get('/ht', (req: Request, res: Response) => {
    res.json({
        message: 'User Service is up and running!',
    });
});

export default app;
