import mongoose from 'mongoose';
import { IQuestion, Question } from './questionModel';
import config from '../config';

export async function connectToDB() {
    const mongoURI = process.env.QUESTION_DB_CLOUD_URI || "mongodb://localhost:27017/question-";

    console.log('MongoDB URI:', mongoURI);
    console.log(process.env.DB_USERNAME, process.env.DB_PASSWORD);

    if (!mongoURI) {
        throw new Error('MongoDB URI not specified');
    } else if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
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
