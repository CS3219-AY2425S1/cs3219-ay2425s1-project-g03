import app from './app';
import 'dotenv/config';
import { connectToDB } from './model/repository';
import config from './config';

const port = config.PORT;

connectToDB()
    .then(() => console.log('MongoDB connected successfully'))
    .then(() => app.listen(port, () => console.log(`User service is listening on port ${port}.`)))
    .catch(error => {
        console.error('Failed to start server');
        console.error(error);
    });
