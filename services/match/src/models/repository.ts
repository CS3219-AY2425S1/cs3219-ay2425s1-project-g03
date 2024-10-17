import mongoose from 'mongoose';
import { Difficulty, MatchRequestModel } from './matchRequestModel';
import { oneMinuteAgo } from '../utils/date';

export async function connectToDB() {
    const mongoURI = process.env.NODE_ENV === 'production' ? process.env.DB_CLOUD_URI : process.env.DB_LOCAL_URI;

    console.log('MongoDB URI:', mongoURI);

    if (!mongoURI) {
        throw new Error('MongoDB URI not specified');
    } else if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
        throw Error('MongoDB credentials not specified');
    }

    await mongoose.connect(mongoURI, {
        authSource: 'admin',
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD,
    });
}

export async function createMatchRequest(userId: string, username: string, topics: string[], difficulty: Difficulty) {
    return await new MatchRequestModel({ userId, username, topics, difficulty }).save();
}

export async function findMatchRequestAndUpdate(id: string, userId: string, topics: string[], difficulty: Difficulty) {
    return await MatchRequestModel.findOneAndUpdate({ _id: id, userId }, { $set: { topics, difficulty } });
}

export async function findMatchRequestAndDelete(id: string, userId: string) {
    return await MatchRequestModel.findOneAndDelete({ _id: id, userId, updatedAt: { $gte: oneMinuteAgo() } });
}

export async function findMatchRequest(id: string, userId: string) {
    return await MatchRequestModel.findOne({ _id: id, userId });
}
