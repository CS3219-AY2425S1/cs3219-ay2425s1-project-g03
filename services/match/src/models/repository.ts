import mongoose, { Types } from 'mongoose';
import { Difficulty, MatchRequestModel } from './matchRequestModel';
import { oneMinuteAgo } from '../utils/date';
import config from '../config';

type IdType = string | Types.ObjectId;

export async function connectToDB() {
    const mongoURI = config.NODE_ENV === 'production' ? config.DB_CLOUD_URI : config.DB_LOCAL_URI;

    console.log('MongoDB URI:', mongoURI);

    if (!mongoURI) {
        throw new Error('MongoDB URI not specified');
    }

    await mongoose.connect(mongoURI, {
        authSource: 'admin',
        user: config.DB_USERNAME,
        pass: config.DB_PASSWORD,
    });
}

export async function createMatchRequest(userId: IdType, username: string, topics: string[], difficulty: Difficulty) {
    return await new MatchRequestModel({ userId, username, topics, difficulty }).save();
}

export async function findMatchRequestAndUpdate(id: IdType, userId: IdType) {
    return await MatchRequestModel.findOneAndUpdate(
        { _id: id, userId, pairId: null },
        { $set: { updatedAt: Date.now() } },
        { new: true },
    );
}

export async function findMatchRequestAndDelete(id: IdType, userId: IdType) {
    return await MatchRequestModel.findOneAndDelete({ _id: id, userId, updatedAt: { $gte: oneMinuteAgo() } });
}

export async function findMatchRequest(id: IdType, userId: IdType) {
    return await MatchRequestModel.findOne({ _id: id, userId });
}

export async function retrieveAllMatchRequests() {
    return await MatchRequestModel.find({ pairId: null, updatedAt: { $gte: oneMinuteAgo() } }).sort({ updatedAt: 1 });
}

export async function findMatchRequestAndAssignPair(
    requestId: IdType,
    userId: IdType,
    topics: string[],
    difficulty: Difficulty,
) {
    return await MatchRequestModel.findOneAndUpdate(
        {
            _id: { $ne: requestId },
            userId: { $ne: userId },
            pairId: null,
            topics: { $in: topics },
            difficulty,
            updatedAt: { $gte: oneMinuteAgo() },
        },
        { $set: { pairId: requestId } },
        { new: true },
    );
}

export async function findMatchRequestByIdAndAssignPair(id: IdType, pairId: IdType) {
    await MatchRequestModel.findByIdAndUpdate(id, { $set: { pairId } }, { new: true });
}

export async function findAndAssignCollab(requestId1: IdType, requestId2: IdType, collabId: IdType) {
    await MatchRequestModel.updateMany({ _id: { $in: [requestId1, requestId2] } }, { $set: { collabId } });
}
