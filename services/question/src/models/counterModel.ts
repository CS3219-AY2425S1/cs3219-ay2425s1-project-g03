import { Schema, model } from 'mongoose';

export interface ICounter {
    _id: string;
    sequence_value: number;
}

const counterSchema = new Schema<ICounter>({
    _id: {
        type: String,
        required: true,
    },
    sequence_value: {
        type: Number,
        required: true,
    },
});

export const Counter = model<ICounter>('Counter', counterSchema);
