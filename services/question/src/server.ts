import app from './app';
import config from './config';
import { initializeConsumers } from './events/consumer';
import { connectToDB, upsertManyQuestions } from './models';
import { getDemoQuestions } from './utils/data';
import { initializeCounter } from './utils/sequence';

const port = config.PORT;

connectToDB()
    .then(() => console.log('MongoDB connected successfully'))
    .then(async () => {
        const questions = await getDemoQuestions();
        await upsertManyQuestions(questions);
    })
    .then(() => console.log('Questions synced successfully'))
    .then(async () => initializeCounter())
    .then(() => console.log('Question ID initialized successfully'))
    .then(async () => await initializeConsumers())
    .then(() => console.log('Consumers are listening'))
    .then(() => app.listen(port, () => console.log(`Question service is listening on port ${port}.`)))
    .catch(error => {
        console.error('Failed to start server');
        console.error(error);
    });
