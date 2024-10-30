import app from './app';
import config from './config';
import messageBroker from './events/broker';
import { initializeConsumers } from './events/consumer';
import { connectToDB, upsertManyQuestions } from './models';
import { getDemoQuestions } from './utils/data';
import { initializeCounter } from './utils/sequence';

const port = config.PORT;

connectToDB()
    .then(async () => {
        console.log('MongoDB connected successfully');
        return await getDemoQuestions();
    })
    .then(questions => upsertManyQuestions(questions))
    .then(() => {
        console.log('Questions synced successfully');
        return initializeCounter();
    })
    .then(() => {
        console.log('Question ID initialized successfully');
        app.listen(port, () => console.log(`Question service is listening on port ${port}.`));
    })
    .then(async () => await messageBroker.connect())
    .then(async () => await initializeConsumers())
    .catch(error => {
        console.error('Failed to start server');
        console.error(error);
    });
