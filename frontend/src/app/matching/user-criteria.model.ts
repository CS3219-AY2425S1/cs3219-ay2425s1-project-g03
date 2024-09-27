export interface UserCriteria {
    topics: string[] | null;
    difficulty: 'easy' | 'medium' | 'hard' | null;
}
