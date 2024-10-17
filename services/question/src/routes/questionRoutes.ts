import { Router } from 'express';
import {
    getQuestions,
    getQuestionById,
    getQuestionByParameters,
    getTopics,
    addQuestion,
    deleteQuestion,
    updateQuestion,
    deleteQuestions,
} from '../controllers/questionController';

/**
 * Router for question endpoints.
 */

const questionRouter = Router();

/**
 * Get questions (or anything related to questions) from the database.
 */
questionRouter.get('/search', getQuestionByParameters);
questionRouter.get('/topics', getTopics);
questionRouter.get('/', getQuestions);
questionRouter.get('/:id', getQuestionById);

/**
 * Add a new question to the database.
 */
questionRouter.post('/', addQuestion);

/**
 * Update a question in the database.
 */
questionRouter.put('/:id', updateQuestion);

/**
 * Delete a question from the database.
 */
questionRouter.delete('/:id', deleteQuestion);

/**
 * Delete questions from the database.
 */
questionRouter.post('/delete', deleteQuestions);

export default questionRouter;
