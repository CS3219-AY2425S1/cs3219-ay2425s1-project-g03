import mongoose from 'mongoose';
import config from '../config';
import { HistoryModel, HistoryStatus, IdType, Question, Snapshot, User } from './historyModel';

export async function connectToDB() {
    await mongoose.connect(config.DB_URI);
}

export async function createHistory(roomId: IdType, user1: User, user2: User, question: Question) {
    return await HistoryModel.insertMany([
        { roomId, user: user1, collaborator: user2, question },
        { roomId, user: user2, collaborator: user1, question },
    ]);
}

export async function updateHistory(roomId: IdType, userId: IdType, status: HistoryStatus, snapshot: Snapshot) {
    return await HistoryModel.findOneAndUpdate(
        { roomId, 'user._id': userId },
        { $set: { status, snapshot } },
        { new: true },
    );
}

export async function retrieveHistoryByUserId(userId: IdType) {
    return await HistoryModel.find({ 'user._id': userId });
}
