import { Request, Response } from 'express';
import { handleError, handleNotFound, handleBadRequest, handleSuccess } from '../utils/helpers';
import { Question } from '../models/questionModel';

/**
 * This endpoint allows the retrieval of all the questions in the database (or can filter by optional parameters).
 * @param req
 * @param res
 */
export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { title, description, topics, difficulty } = req.query;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (title) {
            query.title = { $regex: `^${title as string}$`, $options: 'i' };
        }
        if (description) {
            const words = (description as string).split(' ');
            query.description = { $regex: words.join('|'), $options: 'i' };
        }
        if (topics) {
            const topicsArray = (topics as string).split(',');
            query.topics = {
                $in: topicsArray.map(topic => new RegExp(topic, 'i')),
            };
        }
        if (difficulty) {
            query.difficulty = difficulty as string;
        }

        const questions = await Question.find(query);

        if ((title || description || topics || difficulty) && questions.length === 0) {
            return handleNotFound(res, 'No questions found matching the provided parameters.');
        }

        handleSuccess(res, 200, 'Questions retrieved successfully', questions);
    } catch (error) {
        console.error('Error in getQuestions:', error);
        handleError(res, error, 'Failed to retrieve questions');
    }
};

/**
 * This endpoint allows the retrieval of the question by using the question ID.
 * @param req
 * @param res
 */
export const getQuestionById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const newId = parseInt(id, 10);
    if (isNaN(parseInt(id, 10))) {
        return handleBadRequest(res, 'Invalid question ID');
    }

    try {
        const question = await Question.findOne({ id: newId });

        if (!question) {
            return handleNotFound(res, 'Question not found');
        }

        handleSuccess(res, 200, 'Question with ID retrieved successfully', question);
    } catch (error) {
        console.error('Error in getQuestionById:', error);
        handleError(res, error, 'Failed to retrieve question');
    }
};

/**
 * This endpoint allows the retrieval of random questions that matches the parameters provided.
 * @param req
 * @param res
 */
export const getQuestionByParameters = async (req: Request, res: Response) => {
    const { limit, topics, difficulty } = req.query;

    if (!topics) {
        return handleBadRequest(res, 'Topics are required');
    }
    if (!difficulty) {
        return handleBadRequest(res, 'Difficulty is required');
    }

    let newLimit;
    if (limit) {
        newLimit = parseInt(limit as string, 10);
    } else {
        newLimit = 1;
    }
    if (isNaN(newLimit)) {
        return handleBadRequest(res, 'Limit must be a valid positive integer');
    }
    if (newLimit <= 0) {
        return handleBadRequest(res, 'Limit must be more than 0');
    }

    try {
        const topicsArray = (topics as string).split(',');
        const query = {
            topics: { $in: topicsArray.map(topic => new RegExp(topic, 'i')) },
            difficulty: difficulty,
        };
        const numOfQuestions = await Question.countDocuments(query);

        if (numOfQuestions === 0) {
            return handleNotFound(res, 'No questions found with the given parameters');
        }

        const finalLimit = Math.min(newLimit, numOfQuestions);
        const questions = await Question.aggregate([{ $match: query }, { $sample: { size: finalLimit } }]);

        handleSuccess(res, 200, 'Questions with Parameters retrieved successfully', questions);
    } catch (error) {
        console.error('Error in getQuestionByParameters:', error);
        handleError(res, error, 'Failed to search for questions');
    }
};

/**
 * This endpoint retrieves all unique topics in the database
 * @param req
 * @param res
 */
export const getTopics = async (req: Request, res: Response) => {
    try {
        const topics = await Question.distinct('topics');

        if (!topics || topics.length === 0) {
            return handleNotFound(res, 'No topics found');
        }

        handleSuccess(res, 200, 'Topics retrieved successfully', topics);
    } catch (error) {
        console.error('Error in getTopics:', error);
        handleError(res, error, 'Failed to retrieve topics');
    }
};

/**
 * This endpoint allows to add new question into the database
 * @param req
 * @param res
 */
export const addQuestion = async (req: Request, res: Response) => {
    const { id, title, description, topics, difficulty } = req.body;

    if (!id) {
        return handleBadRequest(res, 'ID is required');
    }
    if (!title) {
        return handleBadRequest(res, 'Title is required');
    }
    if (!description) {
        return handleBadRequest(res, 'Description is required');
    }
    if (!topics) {
        return handleBadRequest(res, 'Topics are required');
    }
    if (!difficulty) {
        return handleBadRequest(res, 'Difficulty is required');
    }

    try {
        const existingQuestion = await Question.findOne({
            $or: [
                { id },
                { title: { $regex: `^${title}$`, $options: 'i' } },
                { description: { $regex: `^${description}$`, $options: 'i' } },
            ],
        });
        if (existingQuestion) {
            return handleBadRequest(res, `A question with ID ${id} already exists`);
        }

        const newQuestion = new Question({
            id,
            title,
            description,
            topics,
            difficulty,
        });

        const savedQuestion = await newQuestion.save();
        handleSuccess(res, 201, 'Question created successfully', savedQuestion);
    } catch (error) {
        handleError(res, error, 'Failed to add question');
    }
};

/**
 * This endpoint allows updating an existing question (only can update the title, description, topics and difficulty).
 * @param req
 * @param res
 */
export const updateQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = { ...req.body };

    if ('id' in updates) {
        return handleBadRequest(res, 'ID cannot be updated');
    }

    try {
        const updatedQuestion = await Question.findOneAndUpdate({ id: parseInt(id, 10) }, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedQuestion) {
            return handleNotFound(res, 'Question not found');
        }

        handleSuccess(res, 200, 'Question updated successfully', updatedQuestion);
    } catch (error) {
        handleError(res, error, 'Failed to update question');
    }
};

/**
 * This endpoint allows deletion of a question by the question ID.
 * @param req
 * @param res
 */
export const deleteQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const deletedID = parseInt(id, 10);
        const deletedQuestion = await Question.findOneAndDelete({ id: deletedID });

        if (!deletedQuestion) {
            return handleNotFound(res, 'Question not found');
        }

        handleSuccess(res, 200, 'Question deleted successfully', deletedQuestion);
    } catch (error) {
        handleError(res, error, 'Failed to delete question');
    }
};
