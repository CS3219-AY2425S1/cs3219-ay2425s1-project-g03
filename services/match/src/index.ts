import app from './app';
import { connectToDB } from './models';

const port = process.env.PORT || 8082;

connectToDB()
    .then(() => console.log('MongoDB connected successfully'))
    .then(() => app.listen(port, () => console.log(`Question service is listening on port ${port}.`)))
    .catch(error => {
        console.error('Failed to start server');
        console.error(error);
    });
