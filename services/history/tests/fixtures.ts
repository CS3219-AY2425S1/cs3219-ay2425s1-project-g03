import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Difficulty, Question, User } from '../src/models/historyModel';
import config from '../src/config';

export const roomId = new Types.ObjectId();
export const user1: User = { _id: new Types.ObjectId(), username: 'user1' };
export const user2: User = { _id: new Types.ObjectId(), username: 'user2' };
export const users = [user1, user2];
export const question: Question = {
    id: 10,
    title: 'title',
    description: 'desc',
    topics: ['Arrays'],
    difficulty: Difficulty.Easy,
};

export const user1Token = jwt.sign(
    {
        id: user1._id,
        username: user1.username,
        role: 'user',
    },
    config.JWT_SECRET,
    {
        expiresIn: '1d',
    },
);

export const user3Token = jwt.sign(
    {
        id: new Types.ObjectId(),
        username: 'user3',
        role: 'user',
    },
    config.JWT_SECRET,
    {
        expiresIn: '1d',
    },
);

export const snapshot = {
    language: 'python',
    code: 'print("Hello, World!")',
};
