import { Question } from '../models/questionModel';
import { MatchFoundEvent } from '../types/event';
import messageBroker from './broker';
import { produceMatchFailedEvent, produceQuestionFoundEvent } from './producer';
import { Queues } from './queues';

async function consumeMatchFound(msg: MatchFoundEvent) {
    console.log('Attempting to find questions:', msg);

    const { user1, user2, topics, difficulty } = msg;
    const questions = await Question.find({ topics: { $in: topics }, difficulty }).exec();
    if (!questions.length) {
        console.log('Failed to find questions:', msg);
        await produceMatchFailedEvent(user1.requestId, user2.requestId);
        return;
    }
    const randQuestion = questions[Math.floor(Math.random() * questions.length)];
    console.log('Questions found:', msg, randQuestion);
    await produceQuestionFoundEvent(user1, user2, randQuestion);
}

export async function initializeConsumers() {
    messageBroker.consume(Queues.MATCH_FOUND, consumeMatchFound);
}
