import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Request, Response } from 'express';
import { getQuestions } from '../../src/controllers/questionController';
import { Question } from '../../src/models/questionModel';

chai.use(sinonChai);

describe('getQuestions', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let findStub: sinon.SinonStub;

    beforeEach(() => {
        req = {
            query: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        findStub = sinon.stub(Question, 'find');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should retrieve all questions', async () => {
        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
            { title: 'Question 2', description: 'Description 2', topics: ['topic2'], difficulty: 'medium' },
        ];

        findStub.resolves(mockQuestions);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({});
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions retrieved successfully',
            data: mockQuestions,
        });
    });

    it('should filter questions by title', async () => {
        req.query = { title: 'Question 1' };
        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
            { title: 'Question 2', description: 'Description 2', topics: ['topic2'], difficulty: 'medium' },
        ];

        findStub.resolves(mockQuestions);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({ title: 'Question 1' });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions retrieved successfully',
            data:[{ title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' }],
        });
    });

    it('should filter questions by description', async () => {
        req.query = { description: 'Description 1' };
        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
            { title: 'Question 2', description: 'Description 2', topics: ['topic2'], difficulty: 'medium' },
        ];

        findStub.resolves(mockQuestions);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({ description: '1' });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions retrieved successfully',
            data: [{ title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' }],
        });
    });

    it('should filter questions by topics', async () => {
        req.query = { topics: 'topic1,topic2' };
        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
            { title: 'Question 2', description: 'Description 2', topics: ['topic2'], difficulty: 'medium' },
            { title: 'Question 3', description: 'Description 3', topics: ['topic3'], difficulty: 'hard' },
        ];

        findStub.resolves(mockQuestions);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({ topics: 'topic1, topic2' });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions retrieved successfully',
            data: [
                { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
                { title: 'Question 2', description: 'Description 2', topics: ['topic2'], difficulty: 'medium' },
            ],
        });
    });

    it('should filter questions by difficulty', async () => {
        req.query = { difficulty: 'easy' };
        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
            { title: 'Question 2', description: 'Description 2', topics: ['topic2'], difficulty: 'medium' },
        ];

        findStub.resolves(mockQuestions);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({ difficulty: 'easy' });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions retrieved successfully',
            data: [{ title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' }],
        });
    });

    it('should handle errors', async () => {
        const error = new Error('Database error');
        findStub.rejects(error);

        await getQuestions(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Failed to retrieve questions',
        });
    });
});
