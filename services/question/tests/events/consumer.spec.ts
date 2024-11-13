require('dotenv').config();
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { Question } from '../../src/models/questionModel';
import * as prod from '../../src/events/producer';
import { consumeMatchFound, initializeConsumers } from'../../src/events/consumer';
import { Difficulty, MatchFoundEvent } from '../../src/types/event';
import messageBroker from '../../src/events/broker';
import { Queues } from '../../src/events/queues';

describe('consumeMatchFound', () => {
    let findStub: SinonStub;
    let produceMatchFailedEventStub: SinonStub;
    let produceQuestionFoundEventStub: SinonStub;
    let execStub: SinonStub;

    beforeEach(() => {
        findStub = sinon.stub(Question, 'find');
        produceMatchFailedEventStub = sinon.stub(prod, 'produceMatchFailedEvent');
        produceQuestionFoundEventStub = sinon.stub(prod, 'produceQuestionFoundEvent');
        execStub = sinon.stub().returnsThis();
        findStub.returns({ exec: execStub });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should produce a match failed event if no questions are found', async () => {
        const msg: MatchFoundEvent = {
            user1: { requestId: 'user1', id: 'id1', username: 'user1', email: 'user1@example.com' },
            user2: { requestId: 'user2', id: 'id2', username: 'user2', email: 'user2@example.com' },
            topics: ['topic1'],
            difficulty: Difficulty.Easy,
        };

        execStub.resolves([]);

        await consumeMatchFound(msg);

        expect(findStub).to.have.been.calledWith({ topics: { $in: ['topic1'] }, difficulty: 'Easy' });
        expect(produceMatchFailedEventStub).to.have.been.calledWith('user1', 'user2');
        expect(produceQuestionFoundEventStub).not.to.have.been.called;
    });

    it('should produce a question found event if questions are found', async () => {
        const msg: MatchFoundEvent = {
            user1: { requestId: 'user1', id: 'id1', username: 'user1', email: 'user1@example.com' },
            user2: { requestId: 'user2', id: 'id2', username: 'user2', email: 'user2@example.com' },
            topics: ['topic1'],
            difficulty: Difficulty.Easy,
        };

        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'Easy' },
        ];

        execStub.resolves(mockQuestions);

        await consumeMatchFound(msg);

        expect(findStub).to.have.been.calledWith({ topics: { $in: ['topic1'] }, difficulty: 'Easy' });
        expect(produceMatchFailedEventStub).not.to.have.been.called;
        expect(produceQuestionFoundEventStub).to.have.been.calledWith(msg.user1, msg.user2, mockQuestions[0]);
    });

    it('should handle errors during question retrieval', async () => {
        const msg: MatchFoundEvent = {
            user1: { requestId: 'user1', id: 'id1', username: 'user1', email: 'user1@example.com' },
            user2: { requestId: 'user2', id: 'id2', username: 'user2', email: 'user2@example.com' },
            topics: ['topic1'],
            difficulty: Difficulty.Easy,
        };

        const error = new Error('Database error');
        execStub.rejects(error);

        try {
            await consumeMatchFound(msg);
        } catch (err) {
            expect(err).to.equal(error);
        }

        expect(findStub).to.have.been.calledWith({ topics: { $in: ['topic1'] }, difficulty: 'Easy' });
        expect(produceMatchFailedEventStub).not.to.have.been.called;
        expect(produceQuestionFoundEventStub).not.to.have.been.called;
    });
});

describe('initializeConsumers', () => {
    let consumeStub: SinonStub;

    beforeEach(() => {
        consumeStub = sinon.stub(messageBroker, 'consume');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initialize consumers correctly', () => {
        initializeConsumers();

        expect(consumeStub).to.have.been.calledWith(Queues.MATCH_FOUND, consumeMatchFound);
    });
});