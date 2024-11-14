import app from './app';
import config from './config';
import { initializeConsumers } from './events/consumer';
import { connectToDB } from './models/repository';

const port = config.PORT;

connectToDB()
    .then(() => console.log('MongoDB connected successfully'))
    .then(async () => await initializeConsumers())
    .then(() => console.log('Consumers are listening'))
    .then(() => app.listen(port, () => console.log(`Match service is listening on port ${port}.`)))
    .catch(error => {
        console.error('Failed to start server');
        console.error(error);
    });
