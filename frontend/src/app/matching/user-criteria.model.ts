export interface UserCriteria {
    topics: string[];
    difficulty: Difficulty;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
