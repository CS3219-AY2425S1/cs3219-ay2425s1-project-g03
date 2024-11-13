import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import { Request, Response } from 'express';
import {
    getQuestions,
    getQuestionById,
    getQuestionByParameters,
    getTopics,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    deleteQuestions,
} from '../../src/controllers/questionController';
import { Question } from '../../src/models/questionModel';
import * as seq from '../../src/utils/sequence';

chai.use(sinonChai);

// Testing function getQuestions
describe('getQuestions', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let findStub: SinonStub;

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
        ];

        findStub.resolves(mockQuestions);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({ title: 'Question 1' });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions retrieved successfully',
            data: mockQuestions,
        });
    });

    it('should filter questions by description', async () => {
        req.query = { description: 'Description 1' };
        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
        ];

        findStub.resolves(mockQuestions);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({ description: { $regex: 'Description|1', $options: 'i' } });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions retrieved successfully',
            data: mockQuestions,
        });
    });

    it('should filter questions by topics', async () => {
        req.query = { topics: 'topic1,topic2' };
        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
            { title: 'Question 2', description: 'Description 2', topics: ['topic2'], difficulty: 'medium' },
        ];

        findStub.resolves(mockQuestions);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({ topics: { $in: [/topic1/i, /topic2/i] } });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions retrieved successfully',
            data: mockQuestions,
        });
    });

    it('should filter questions by difficulty', async () => {
        req.query = { difficulty: 'easy' };
        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
        ];

        findStub.resolves(mockQuestions);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({ difficulty: 'easy' });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions retrieved successfully',
            data: mockQuestions,
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

    it('should return no questions found', async () => {
        req.query = { title: 'Question 3' };

        findStub.resolves([]);

        await getQuestions(req as Request, res as Response);

        expect(findStub).to.have.been.calledWith({ title: 'Question 3' });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'No questions found matching the provided parameters.',
            data: [],
        });
    });
});

// Testing function getQuestionById
describe('getQuestionById', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let findOneStub: SinonStub;

    beforeEach(() => {
        req = {
            params: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        findOneStub = sinon.stub(Question, 'findOne');
    });

    afterEach(() => {
        sinon.restore();
    });
    it('should retrieve a question by ID', async () => {
        const mockQuestion = {
            id: 1,
            title: 'Question 1',
            description: 'Description 1',
            topics: ['topic1'],
            difficulty: 'easy',
        };
        req.params = { id: '1' };

        findOneStub.resolves(mockQuestion);

        await getQuestionById(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({ id: 1 });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Question with ID retrieved successfully',
            data: mockQuestion,
        });
    });

    it('should return an error for an invalid question ID', async () => {
        req.params = { id: 'invalid' };

        await getQuestionById(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Invalid question ID',
        });
    });

    it('should return a not found error if the question does not exist', async () => {
        req.params = { id: '1' };

        findOneStub.resolves(null);

        await getQuestionById(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({ id: 1 });
        expect(res.status).to.have.been.calledWith(404);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Question not found',
        });
    });

    it('should handle errors during the retrieval process', async () => {
        req.params = { id: '1' };

        const error = new Error('Database error');
        findOneStub.rejects(error);

        await getQuestionById(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({ id: 1 });
        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Failed to retrieve question',
        });
    });
});

// Testing function getQuestionByParameters
describe('getQuestionByParameters', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let countDocumentsStub: SinonStub;
    let aggregateStub: SinonStub;

    beforeEach(() => {
        req = {
            query: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        countDocumentsStub = sinon.stub(Question, 'countDocuments');
        aggregateStub = sinon.stub(Question, 'aggregate');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return bad request if topics are not provided', async () => {
        req.query = { difficulty: 'easy' };

        await getQuestionByParameters(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Topics are required',
        });
    });

    it('should return bad request if difficulty is not provided', async () => {
        req.query = { topics: 'topic1,topic2' };

        await getQuestionByParameters(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Difficulty is required',
        });
    });

    it('should return bad request if limit is not a valid positive integer', async () => {
        req.query = { topics: 'topic1,topic2', difficulty: 'easy', limit: 'invalid' };

        await getQuestionByParameters(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Limit must be a valid positive integer',
        });
    });

    it('should return bad request if limit is less than or equal to 0', async () => {
        req.query = { topics: 'topic1,topic2', difficulty: 'easy', limit: '0' };

        await getQuestionByParameters(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Limit must be more than 0',
        });
    });

    it('should return no questions found if none match the parameters', async () => {
        req.query = { topics: 'topic1,topic2', difficulty: 'easy', limit: '1' };

        countDocumentsStub.resolves(0);

        await getQuestionByParameters(req as Request, res as Response);

        expect(countDocumentsStub).to.have.been.calledWith({
            topics: { $in: [/topic1/i, /topic2/i] },
            difficulty: 'easy',
        });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'No questions found with the given parameters',
            data: [],
        });
    });

    it('should retrieve questions matching the parameters', async () => {
        req.query = { topics: 'topic1,topic2', difficulty: 'easy', limit: '2' };

        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
            { title: 'Question 2', description: 'Description 2', topics: ['topic2'], difficulty: 'easy' },
        ];

        countDocumentsStub.resolves(2);
        aggregateStub.resolves(mockQuestions);

        await getQuestionByParameters(req as Request, res as Response);

        expect(countDocumentsStub).to.have.been.calledWith({
            topics: { $in: [/topic1/i, /topic2/i] },
            difficulty: 'easy',
        });
        expect(aggregateStub).to.have.been.calledWith([
            { $match: { topics: { $in: [/topic1/i, /topic2/i] }, difficulty: 'easy' } },
            { $sample: { size: 2 } },
        ]);
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions with Parameters retrieved successfully',
            data: mockQuestions,
        });
    });

    it('should retrieve questions matching limit', async () => {
        req.query = { topics: 'topic1,topic2', difficulty: 'easy', limit: '1' };

        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
        ];

        countDocumentsStub.resolves(2);
        aggregateStub.resolves(mockQuestions);

        await getQuestionByParameters(req as Request, res as Response);

        expect(countDocumentsStub).to.have.been.calledWith({
            topics: { $in: [/topic1/i, /topic2/i] },
            difficulty: 'easy',
        });
        expect(aggregateStub).to.have.been.calledWith([
            { $match: { topics: { $in: [/topic1/i, /topic2/i] }, difficulty: 'easy' } },
            { $sample: { size: 1 } },
        ]);
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions with Parameters retrieved successfully',
            data: mockQuestions,
        });
    });

    it('should retrieve questions matching number of questions', async () => {
        req.query = { topics: 'topic1,topic2', difficulty: 'easy', limit: '2' };

        const mockQuestions = [
            { title: 'Question 1', description: 'Description 1', topics: ['topic1'], difficulty: 'easy' },
        ];

        countDocumentsStub.resolves(1);
        aggregateStub.resolves(mockQuestions);

        await getQuestionByParameters(req as Request, res as Response);

        expect(countDocumentsStub).to.have.been.calledWith({
            topics: { $in: [/topic1/i, /topic2/i] },
            difficulty: 'easy',
        });
        expect(aggregateStub).to.have.been.calledWith([
            { $match: { topics: { $in: [/topic1/i, /topic2/i] }, difficulty: 'easy' } },
            { $sample: { size: 1 } },
        ]);
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions with Parameters retrieved successfully',
            data: mockQuestions,
        });
    });

    it('should handle errors during the retrieval process', async () => {
        req.query = { topics: 'topic1,topic2', difficulty: 'easy', limit: '2' };

        const error = new Error('Database error');
        countDocumentsStub.rejects(error);

        await getQuestionByParameters(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Failed to search for questions',
        });
    });
});

describe('getTopics', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let distinctStub: SinonStub;

    beforeEach(() => {
        req = {};
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        distinctStub = sinon.stub(Question, 'distinct');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should retrieve all unique topics', async () => {
        const mockTopics = ['topic1', 'topic2', 'topic3'];

        distinctStub.resolves(mockTopics);

        await getTopics(req as Request, res as Response);

        expect(distinctStub).to.have.been.calledWith('topics');
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Topics retrieved successfully',
            data: mockTopics,
        });
    });

    it('should handle errors during the retrieval process', async () => {
        const error = new Error('Database error');
        distinctStub.rejects(error);

        await getTopics(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Failed to retrieve topics',
        });
    });
});

// Testing function addQuestion
describe('addQuestion', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let saveStub: SinonStub;
    let findOneStub: SinonStub;
    let getNextSequenceValueStub: SinonStub;
    let collationStub: SinonStub;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        saveStub = sinon.stub(Question.prototype, 'save');
        findOneStub = sinon.stub(Question, 'findOne');
        getNextSequenceValueStub = sinon.stub(seq, 'getNextSequenceValue');
        collationStub = sinon.stub().returnsThis();
        findOneStub.returns({ collation: collationStub });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should add a new question successfully', async () => {
        req.body = {
            title: 'New Question',
            description: 'New Description',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        collationStub.resolves(null);
        getNextSequenceValueStub.resolves(1);
        saveStub.resolves({
            id: 1,
            title: 'New Question',
            description: 'New Description',
            topics: ['topic1'],
            difficulty: 'easy',
        });

        await addQuestion(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({
            $or: [{ title: 'New Question' }, { description: 'New Description' }],
        });
        expect(getNextSequenceValueStub).to.have.been.calledWith('questionId');
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(saveStub).to.have.been.calledOnce;
        expect(res.status).to.have.been.calledWith(201);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Question created successfully',
            data: {
                id: 1,
                title: 'New Question',
                description: 'New Description',
                topics: ['topic1'],
                difficulty: 'easy',
            },
        });
    });

    it('should return bad request if title is missing', async () => {
        req.body = {
            description: 'New Description',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Title is required',
        });
    });

    it('should return bad request if description is missing', async () => {
        req.body = {
            title: 'New Question',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Description is required',
        });
    });

    it('should return bad request if topics are missing', async () => {
        req.body = {
            title: 'New Question',
            description: 'New Description',
            difficulty: 'easy',
        };

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Topics are required',
        });
    });

    it('should return bad request if difficulty is missing', async () => {
        req.body = {
            title: 'New Question',
            description: 'New Description',
            topics: ['topic1'],
        };

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Difficulty is required',
        });
    });

    it('should return bad request if a question with the same title exists', async () => {
        req.body = {
            title: 'Existing Question',
            description: 'Non-Existing Description',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        collationStub.resolves({
            id: 1,
            title: 'Existing Question',
            description: 'Existing Description',
            topics: ['topic1'],
            difficulty: 'easy',
        });

        await addQuestion(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({
            $or: [{ title: 'Existing Question' }, { description: 'Non-Existing Description' }],
        });
        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'A question with the same title or description already exists.',
        });
    });

    it('should return bad request if a question with the same description exists', async () => {
        req.body = {
            title: 'Non-Existing Question',
            description: 'Existing Description',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        collationStub.resolves({
            id: 1,
            title: 'Existing Question',
            description: 'Exiing Dstescription',
            topics: ['topic1'],
            difficulty: 'easy',
        });

        await addQuestion(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({
            $or: [{ title: 'Non-Existing Question' }, { description: 'Existing Description' }],
        });
        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'A question with the same title or description already exists.',
        });
    });

    it('should handle errors during the addition process', async () => {
        req.body = {
            title: 'New Question',
            description: 'New Description',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        const error = new Error('Database error');
        findOneStub.rejects(error);

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Failed to add question',
        });
    });

    it('should return bad request if title is missing', async () => {
        req.body = {
            description: 'New Description',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Title is required',
        });
    });

    it('should return bad request if description is missing', async () => {
        req.body = {
            title: 'New Question',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Description is required',
        });
    });

    it('should return bad request if topics are missing', async () => {
        req.body = {
            title: 'New Question',
            description: 'New Description',
            difficulty: 'easy',
        };

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Topics are required',
        });
    });

    it('should return bad request if difficulty is missing', async () => {
        req.body = {
            title: 'New Question',
            description: 'New Description',
            topics: ['topic1'],
        };

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Difficulty is required',
        });
    });

    it('should return bad request if a question with the same title or description already exists', async () => {
        req.body = {
            title: 'Existing Question',
            description: 'Existing Description',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        collationStub.resolves({
            id: 1,
            title: 'Existing Question',
            description: 'Existing Description',
            topics: ['topic1'],
            difficulty: 'easy',
        });

        await addQuestion(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({
            $or: [{ title: 'Existing Question' }, { description: 'Existing Description' }],
        });
        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'A question with the same title or description already exists.',
        });
    });

    it('should handle errors during the addition process', async () => {
        req.body = {
            title: 'New Question',
            description: 'New Description',
            topics: ['topic1'],
            difficulty: 'easy',
        };

        const error = new Error('Database error');
        findOneStub.rejects(error);

        await addQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Failed to add question',
        });
    });
});

// Testing function updateQuestion
describe('updateQuestion', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let findOneStub: SinonStub;
    let findOneAndUpdateStub: SinonStub;
    let collationStub: SinonStub;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        findOneStub = sinon.stub(Question, 'findOne');
        findOneAndUpdateStub = sinon.stub(Question, 'findOneAndUpdate');
        collationStub = sinon.stub().returnsThis();
        findOneStub.returns({ collation: collationStub });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should update a question successfully', async () => {
        req.params = { id: '1' };
        req.body = {
            title: 'Updated Title',
            description: 'Updated Description',
            topics: ['topic1'],
            difficulty: 'medium',
        };

        collationStub.resolves(null);
        findOneAndUpdateStub.resolves({
            id: 1,
            title: 'Updated Title',
            description: 'Updated Description',
            topics: ['topic1'],
            difficulty: 'medium',
        });

        await updateQuestion(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({
            $and: [{ $or: [{ title: 'Updated Title' }, { description: 'Updated Description' }] }, { id: { $ne: 1 } }],
        });
        expect(findOneAndUpdateStub).to.have.been.calledWith(
            { id: 1 },
            { title: 'Updated Title', description: 'Updated Description', topics: ['topic1'], difficulty: 'medium' },
            { new: true, runValidators: true },
        );
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Question updated successfully',
            data: {
                id: 1,
                title: 'Updated Title',
                description: 'Updated Description',
                topics: ['topic1'],
                difficulty: 'medium',
            },
        });
    });

    it('should return bad request if ID is in updates', async () => {
        req.params = { id: '1' };
        req.body = { id: '2', title: 'Updated Title' };

        await updateQuestion(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'ID cannot be updated',
        });
    });

    it('should return bad request if a question with the same title or description exists', async () => {
        req.params = { id: '1' };
        req.body = { title: 'Existing Title', description: 'Updated Description' };

        collationStub.resolves({
            id: 2,
            title: 'Existing Title',
            description: 'Existing Description',
        });

        await updateQuestion(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({
            $and: [{ $or: [{ title: 'Existing Title' }, { description: 'Updated Description' }] }, { id: { $ne: 1 } }],
        });
        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'A question with the same title or description already exists.',
        });
    });

    it('should return not found if the question does not exist', async () => {
        req.params = { id: '1' };
        req.body = { title: 'Updated Title', description: 'Updated Description' };

        collationStub.resolves(null);
        findOneAndUpdateStub.resolves(null);

        await updateQuestion(req as Request, res as Response);

        expect(findOneAndUpdateStub).to.have.been.calledWith(
            { id: 1 },
            { title: 'Updated Title', description: 'Updated Description' },
            { new: true, runValidators: true },
        );
        expect(res.status).to.have.been.calledWith(404);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Question not found',
        });
    });

    it('should handle errors during the update process', async () => {
        req.params = { id: '1' };
        req.body = { title: 'Updated Title', description: 'Updated Description' };

        const error = new Error('Database error');
        findOneStub.rejects(error);

        await updateQuestion(req as Request, res as Response);

        expect(findOneStub).to.have.been.calledWith({
            $and: [{ $or: [{ title: 'Updated Title' }, { description: 'Updated Description' }] }, { id: { $ne: 1 } }],
        });
        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Failed to update question',
        });
    });
});

// Testing function deleteQuestion
describe('deleteQuestion', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let findOneAndDeleteStub: SinonStub;

    beforeEach(() => {
        req = {
            params: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        findOneAndDeleteStub = sinon.stub(Question, 'findOneAndDelete');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should delete a question successfully', async () => {
        req.params = { id: '1' };

        findOneAndDeleteStub.resolves({
            id: 1,
            title: 'Question 1',
            description: 'Description 1',
            topics: ['topic1'],
            difficulty: 'easy',
        });

        await deleteQuestion(req as Request, res as Response);

        expect(findOneAndDeleteStub).to.have.been.calledWith({ id: 1 });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Question deleted successfully',
            data: {
                id: 1,
                title: 'Question 1',
                description: 'Description 1',
                topics: ['topic1'],
                difficulty: 'easy',
            },
        });
    });

    it('should return not found if the question does not exist', async () => {
        req.params = { id: '1' };

        findOneAndDeleteStub.resolves(null);

        await deleteQuestion(req as Request, res as Response);

        expect(findOneAndDeleteStub).to.have.been.calledWith({ id: 1 });
        expect(res.status).to.have.been.calledWith(404);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Question not found',
        });
    });

    it('should handle errors during the deletion process', async () => {
        req.params = { id: '1' };

        const error = new Error('Database error');
        findOneAndDeleteStub.rejects(error);

        await deleteQuestion(req as Request, res as Response);

        expect(findOneAndDeleteStub).to.have.been.calledWith({ id: 1 });
        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Failed to delete question',
        });
    });
});

// Testing function deleteQuestions
describe('deleteQuestions', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let countDocumentsStub: SinonStub;
    let deleteManyStub: SinonStub;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        countDocumentsStub = sinon.stub(Question, 'countDocuments');
        deleteManyStub = sinon.stub(Question, 'deleteMany');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should delete multiple questions successfully', async () => {
        req.body = { ids: ['1', '2', '3'] };

        countDocumentsStub.resolves(3);
        deleteManyStub.resolves({ deletedCount: 3 });

        await deleteQuestions(req as Request, res as Response);

        expect(countDocumentsStub).to.have.been.calledWith({ id: { $in: [1, 2, 3] } });
        expect(deleteManyStub).to.have.been.calledWith({ id: { $in: [1, 2, 3] } });
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
            status: 'Success',
            message: 'Questions deleted successfully',
            data: null,
        });
    });

    it('should return bad request if IDs are missing or not an array', async () => {
        req.body = { ids: '1,2,3' };

        await deleteQuestions(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'IDs are missing or not specified as an array',
        });
    });

    it('should return bad request if any ID is invalid', async () => {
        req.body = { ids: ['1', 'invalid', '3'] };

        await deleteQuestions(req as Request, res as Response);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Invalid question ID',
        });
    });

    it('should return not found if some questions do not exist', async () => {
        req.body = { ids: ['1', '2', '3'] };

        countDocumentsStub.resolves(2);

        await deleteQuestions(req as Request, res as Response);

        expect(countDocumentsStub).to.have.been.calledWith({ id: { $in: [1, 2, 3] } });
        expect(res.status).to.have.been.calledWith(404);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Question not found',
        });
    });

    it('should handle errors during the deletion process', async () => {
        req.body = { ids: ['1', '2', '3'] };

        const error = new Error('Database error');
        countDocumentsStub.rejects(error);

        await deleteQuestions(req as Request, res as Response);

        expect(countDocumentsStub).to.have.been.calledWith({ id: { $in: [1, 2, 3] } });
        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            status: 'Error',
            message: 'Failed to delete questions',
        });
    });
});
