import { model, Schema } from 'mongoose';

enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

export interface IQuestion {
    id: number;
    title: string;
    description: string;
    topics: [string];
    difficulty: Difficulty;
}

const questionSchema = new Schema<IQuestion>(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
            immutable: true,
        },
        title: {
            type: String,
            required: true,
            unique: true,
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
    },
    { versionKey: false },
);

export const Question = model<IQuestion>('Question', questionSchema);
