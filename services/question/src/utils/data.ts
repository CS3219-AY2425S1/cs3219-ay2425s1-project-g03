import fs from 'fs/promises';
import { IQuestion } from '../models/questionModel';

export async function getDemoQuestions(): Promise<IQuestion[]> {
    try {
        const data = await fs.readFile('./src/data/questions.json', { encoding: 'utf8' });
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading questions from JSON:', error);
        throw new Error('Failed to read demo questions');
    }
}
