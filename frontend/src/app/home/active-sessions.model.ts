import { DifficultyLevels } from '../questions/difficulty-levels.enum';

export interface ActiveSession {
    questionTitle: string;
    difficulty: DifficultyLevels; // Assuming DifficultyLevel is an enum
    peer: string;
}
