import { expect } from 'chai';
import sinon from 'sinon';
import { Question } from '../../src/models/questionModel';
import { Counter } from '../../src/models/counterModel';
import { initializeCounter, getNextSequenceValue } from '../../src/utils/sequence';

describe('Sequence Functions', () => {
    describe('initializeCounter', () => {
        let findOneQuestionStub: sinon.SinonStub;
        let findOneAndUpdateCounterStub: sinon.SinonStub;
        let sortStub: sinon.SinonStub;
        let execStub: sinon.SinonStub;

        beforeEach(() => {
            findOneQuestionStub = sinon.stub(Question, 'findOne');
            findOneAndUpdateCounterStub = sinon.stub(Counter, 'findOneAndUpdate');
            sortStub = sinon.stub().returnsThis();
            execStub = sinon.stub().returnsThis();
            findOneQuestionStub.returns({ sort: sortStub, exec: execStub });
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should initialize counter with max question ID', async () => {
            const mockQuestion = { id: 5 };
            execStub.resolves(mockQuestion);

            await initializeCounter();

            expect(findOneQuestionStub).to.have.been.calledOnce;
            expect(sortStub).to.have.been.calledWith('-id');
            expect(findOneAndUpdateCounterStub).to.have.been.calledWith(
                { _id: 'questionId' },
                { $set: { sequence_value: mockQuestion.id } },
                { upsert: true }
            );
        });

        it('should initialize counter with zero if no questions found', async () => {
            execStub.resolves(null);

            await initializeCounter();

            expect(findOneQuestionStub).to.have.been.calledOnce;
            expect(sortStub).to.have.been.calledWith('-id');
            expect(findOneAndUpdateCounterStub).to.have.been.calledWith(
                { _id: 'questionId' },
                { $set: { sequence_value: 0 } },
                { upsert: true }
            );
        });
    });

    describe('getNextSequenceValue', () => {
        let findByIdAndUpdateStub: sinon.SinonStub;

        beforeEach(() => {
            findByIdAndUpdateStub = sinon.stub(Counter, 'findByIdAndUpdate');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should increment and return the next sequence value', async () => {
            const mockCounter = { sequence_value: 6 };
            findByIdAndUpdateStub.resolves(mockCounter);

            const sequenceName = 'questionId';
            const result = await getNextSequenceValue(sequenceName);

            expect(findByIdAndUpdateStub).to.have.been.calledWith(
                sequenceName,
                { $inc: { sequence_value: 1 } },
                { new: true, upsert: true }
            );
            expect(result).to.equal(mockCounter.sequence_value);
        });

        it('should handle errors during sequence value retrieval', async () => {
            findByIdAndUpdateStub.rejects(new Error('Database error'));

            try {
                await getNextSequenceValue('questionId');
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).to.equal('Database error');
                }
            }
        });
    });
});