import { z } from 'zod';
import { Difficulty } from '../models/matchRequestModel';

export const createMatchRequestSchema = z.object({
    topics: z.array(z.string().min(1)).min(1),
    difficulty: z.nativeEnum(Difficulty),
});
