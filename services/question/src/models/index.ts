import mongoose from 'mongoose';
import { IQuestion, Question } from './questionModel';
import config from '../config';

export async function connectToDB() {
    const mongoURI = config.NODE_ENV === 'production' ? config.DB_CLOUD_URI : config.DB_LOCAL_URI;

    console.log('MongoDB URI:', mongoURI);

    if (!mongoURI) {
        throw new Error('MongoDB URI not specified');
    } else if (!config.DB_USERNAME || !config.DB_PASSWORD) {
        throw Error('MongoDB credentials not specified');
    }

    await mongoose.connect(mongoURI, {
        authSource: 'admin',
        user: config.DB_USERNAME,
        pass: config.DB_PASSWORD,
    });
}

export async function upsertManyQuestions(questions: IQuestion[]) {
    const ops = questions.map(item => ({
        updateOne: {
            filter: { id: item.id },
            update: item,
            upsert: true,
        },
    }));
    await Question.bulkWrite(ops);
}
