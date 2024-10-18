import Joi from 'joi';
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

const questionJoiSchema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    topics: Joi.array().items(Joi.string()).min(1).required(),
    difficulty: Joi.string()
        .valid(...Object.values(Difficulty))
        .required(),
});

export const questionsArrayJoiSchema = Joi.array().items(questionJoiSchema);
