import { Question } from '../models/questionModel';
import { Counter } from '../models/counterModel';

/**
 * Returns the maximum question ID from the database.
 */
export const getMaxQuestionId = async (): Promise<number> => {
    const maxQuestion = await Question.findOne().sort('-id').exec();
    return maxQuestion ? maxQuestion.id : 0;
};

/**
 * This function initializes the counter for the questions.
 */
export async function initializeCounter(maxId?: number) {
    if (!maxId) {
        maxId = await getMaxQuestionId();
    }
    await Counter.findOneAndUpdate({ _id: 'questionId' }, { $set: { sequence_value: maxId } }, { upsert: true });
    console.log(`Question ID initialized to start from: ${maxId}`);
}

/**
 * This function retrieves the next sequence value.
 * @param sequenceName
 */
export const getNextSequenceValue = async (sequenceName: string, count = 1): Promise<number> => {
    const counter = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { sequence_value: count } },
        { new: true, upsert: true },
    );
    console.log(`Updated Question ID: ${counter.sequence_value}`);
    return counter.sequence_value;
};
