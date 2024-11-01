import { IdType, MatchFailedEvent, Question, QuestionFoundEvent, UserWithRequest } from '../types/event';
import messageBroker from './broker';
import { Queues } from './queues';

const QUESTION_FOUND_ERROR = 'No questions were found';

export async function produceQuestionFoundEvent(user1: UserWithRequest, user2: UserWithRequest, question: Question) {
    const message: QuestionFoundEvent = {
        user1,
        user2,
        question,
    };
    await messageBroker.produce(Queues.QUESTION_FOUND, message);
}

export async function produceMatchFailedEvent(requestId1: IdType, requestId2: IdType) {
    const message: MatchFailedEvent = { requestId1, requestId2, reason: QUESTION_FOUND_ERROR };
    await messageBroker.produce(Queues.MATCH_FAILED, message);
}
