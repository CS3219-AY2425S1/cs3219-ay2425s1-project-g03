import { model, Schema, Types } from 'mongoose';

export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

export interface IMatchRequest {
    id: Types.ObjectId;
    userId: Types.ObjectId;
    topics: [string];
    difficulty: Difficulty;
    createdAt: Date;
    updatedAt: Date;
}

const matchRequestSchema = new Schema<IMatchRequest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
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
    },
    { versionKey: false, timestamps: true },
);

export const MatchRequest = model<IMatchRequest>('MatchRequest', matchRequestSchema);
