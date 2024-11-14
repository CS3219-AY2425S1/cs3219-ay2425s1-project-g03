import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';
import { HistoryModel, HistoryStatus } from '../../src/models/historyModel';
import { createHistory, updateHistory } from '../../src/models/repository';
import { question, roomId, user1, user2, users, snapshot } from '../fixtures';

describe('History Repository', function () {
    before(async function () {
        const mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
    });

    after(async function () {
        await mongoose.connection.close();
    });

    afterEach(async function () {
        await HistoryModel.deleteMany();
    });

    describe('createHistory', function () {
        it('Should create history for both users', async function () {
            const result = await createHistory(roomId, user1, user2, question);
            expect(result).to.have.lengthOf(2);
            result.forEach((res, i) => {
                expect(res).to.have.property('roomId').that.equals(roomId);
                expect(res).to.have.property('user');
                expect(res.user).has.property('_id').equal(users[i]._id);
                expect(res.user).has.property('username').equal(users[i].username);
                expect(res).to.have.property('collaborator');
                expect(res.collaborator).has.property('_id').equal(users[+!i]._id);
                expect(res.collaborator).has.property('username').equal(users[+!i].username);
                expect(res).to.have.property('question');
                expect(res.question).has.property('id').equal(question.id);
                expect(res.question).has.property('title').equal(question.title);
                expect(res.question).has.property('description').equal(question.description);
                expect(res.question).has.property('difficulty').equal(question.difficulty);
            });
        });
    });

    describe('updateHistory', function () {
        beforeEach(async function () {
            await createHistory(roomId, user1, user2, question);
        });

        it('Should update history status for a specific user', async function () {
            const updatedHistory = await updateHistory(roomId, user1._id, HistoryStatus.FORFEITED, snapshot);
            expect(updatedHistory).to.not.equal(null);
            expect(updatedHistory).to.have.property('status', HistoryStatus.FORFEITED);
        });

        it('Should return null if no history found', async function () {
            const updatedHistory = await updateHistory(roomId, new Types.ObjectId(), HistoryStatus.FORFEITED, snapshot);
            expect(updatedHistory).to.be.equal(null);
        });
    });
});
