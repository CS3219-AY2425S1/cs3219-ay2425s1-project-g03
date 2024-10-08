import Joi from 'joi';
import { Difficulty } from '../models/matchRequestModel';

export const createMatchRequestSchema = Joi.object({
    topics: Joi.array().items(Joi.string()).min(1).required(),
    difficulty: Joi.string()
        .valid(...Object.values(Difficulty))
        .required(),
});

export const updateMatchRequestSchema = Joi.object({
    topics: Joi.array().items(Joi.string()).min(1),
    difficulty: Joi.string().valid(...Object.values(Difficulty)),
}).min(1);
