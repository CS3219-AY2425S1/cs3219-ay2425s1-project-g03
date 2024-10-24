import app from './app';
import messageBroker from './events/broker';
import { initializeConsumers } from './events/consumer';
import { connectToDB } from './models/repository';

const port = process.env.PORT || 8083;

connectToDB()
    .then(() => console.log('MongoDB connected successfully'))
    .then(async () => await messageBroker.connect())
    .then(async () => await initializeConsumers())
    .then(() => app.listen(port, () => console.log(`Match service is listening on port ${port}.`)))
    .catch(error => {
        console.error('Failed to start server');
        console.error(error);
    });
