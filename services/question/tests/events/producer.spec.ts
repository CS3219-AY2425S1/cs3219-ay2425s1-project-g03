import dotenv from 'dotenv';
dotenv.config();
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import * as producer from '../../src/events/producer';
import messageBroker from '../../src/events/broker';
import { Queues } from '../../src/events/queues';
import {
    UserWithRequest,
    Question,
    IdType,
    QuestionFoundEvent,
    MatchFailedEvent,
    Difficulty,
} from '../../src/types/event';

describe('Producer Tests', () => {
    let produceStub: SinonStub;

    beforeEach(() => {
        produceStub = sinon.stub(messageBroker, 'produce');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('produceQuestionFoundEvent', () => {
        it('should produce a question found event', async () => {
            const user1: UserWithRequest = {
                requestId: 'user1',
                id: 'id1',
                username: 'user1',
                email: 'user1@example.com',
            };
            const user2: UserWithRequest = {
                requestId: 'user2',
                id: 'id2',
                username: 'user2',
                email: 'user2@example.com',
            };
            const question: Question = {
                id: 1,
                title: 'Question 1',
                description: 'Description 1',
                topics: ['topic1'],
                difficulty: Difficulty.Easy,
            };

            const expectedMessage: QuestionFoundEvent = {
                user1,
                user2,
                question,
            };

            await producer.produceQuestionFoundEvent(user1, user2, question);

            expect(produceStub).to.have.been.calledWith(Queues.QUESTION_FOUND, expectedMessage);
        });
    });

    describe('produceMatchFailedEvent', () => {
        it('should produce a match failed event', async () => {
            const requestId1: IdType = 'request1';
            const requestId2: IdType = 'request2';
            const expectedMessage: MatchFailedEvent = { requestId1, requestId2, reason: 'No questions were found' };

            await producer.produceMatchFailedEvent(requestId1, requestId2);

            expect(produceStub).to.have.been.calledWith(Queues.MATCH_FAILED, expectedMessage);
        });
    });
});
