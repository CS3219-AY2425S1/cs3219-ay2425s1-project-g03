import { Question } from '../models/questionModel';
import { Counter } from '../models/counterModel';

/**
 * This function initializes the counter for the questions.
 */
export async function initializeCounter() {
    const maxQuestion = await Question.findOne().sort('-id').exec();
    let maxId = 0;
    if (maxQuestion) {
        maxId = maxQuestion.id;
    }
    await Counter.findOneAndUpdate({ _id: 'questionId' }, { $set: { sequence_value: maxId } }, { upsert: true });
    console.log(`Question ID initialized to start from: ${maxId}`);
}

/**
 * This function retrieves the next sequence value.
 * @param sequenceName
 */
export const getNextSequenceValue = async (sequenceName: string): Promise<number> => {
    const counter = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true },
    );
    console.log(`Updated Question ID: ${counter.sequence_value}`);
    return counter.sequence_value;
};
