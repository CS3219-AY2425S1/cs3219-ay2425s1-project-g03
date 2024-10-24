import mongoose from 'mongoose';
import { IQuestion, Question } from './questionModel';
import config from '../config';

export async function connectToDB() {
    await mongoose.connect(config.DB_URI, {
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
