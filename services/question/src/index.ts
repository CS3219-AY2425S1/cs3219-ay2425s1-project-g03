import app from './app';
import { connectToDB } from './models';
import { initializeCounter } from './utils/sequence';

const port = process.env.PORT || 8081;

connectToDB()
    .then(() => console.log('MongoDB connected successfully'))
    .then(async () => await initializeCounter())
    .then(() => console.log('Question ID initialized successfully'))
    .then(() => app.listen(port, () => console.log(`Question service is listening on port ${port}.`)))
    .catch(error => {
        console.error('Failed to start server');
        console.error(error);
    });
