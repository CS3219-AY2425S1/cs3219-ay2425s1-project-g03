import { model, Schema, Types } from 'mongoose';

export type IdType = Types.ObjectId | string;

export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

export enum HistoryStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    FORFEITED = 'FORFEITED',
    COMPLETED = 'COMPLETED',
}

export interface User {
    _id: Types.ObjectId;
    username: string;
}

export interface Question {
    id: number;
    title: string;
    description: string;
    topics: [string];
    difficulty: Difficulty;
}

export interface History {
    roomId: Types.ObjectId;
    user: User;
    collaborator: User;
    question: Question;
    status: HistoryStatus;
    snapshot: Snapshot;
}

export interface Snapshot {
    language: string;
    code: string;
}

const userSchema = new Schema<User>({
    username: {
        type: String,
        required: true,
    },
});

const questionSchema = new Schema<Question>({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    topics: {
        type: [String],
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard'],
    },
});

const snapshotSchema = new Schema<Snapshot>({
    language: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
});

const historySchema = new Schema<History>(
    {
        roomId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        user: userSchema,
        collaborator: userSchema,
        question: questionSchema,
        status: {
            type: String,
            enum: Object.values(HistoryStatus),
            default: HistoryStatus.IN_PROGRESS,
        },
        snapshot: snapshotSchema,
    },
    { versionKey: false, timestamps: true },
);

export const HistoryModel = model<History>('History', historySchema);
