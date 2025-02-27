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
import { verifyAccessToken, verifyIsAdmin } from '../middleware/jwt';

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
questionRouter.post('/', verifyAccessToken, verifyIsAdmin, addQuestion);

/**
 * Update a question in the database.
 */
questionRouter.put('/:id', verifyAccessToken, verifyIsAdmin, updateQuestion);

/**
 * Delete a question from the database.
 */
questionRouter.delete('/:id', verifyAccessToken, verifyIsAdmin, deleteQuestion);

/**
 * Delete questions from the database.
 */
questionRouter.post('/delete', verifyAccessToken, verifyIsAdmin, deleteQuestions);

export default questionRouter;
