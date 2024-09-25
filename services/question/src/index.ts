import app from './app';
import { connectToDB, upsertManyQuestions } from './models';
import { getDemoQuestions } from './utils/data';
import { initializeCounter } from './utils/sequence';

const port = process.env.PORT || 8081;

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
    .catch(error => {
        console.error('Failed to start server');
        console.error(error);
    });
