import dotenv from 'dotenv';
dotenv.config({ path: '.env.sample' });

import { use, expect } from 'chai';
import chaiHttp from 'chai-http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { HistoryModel } from '../../src/models/historyModel';
import { createHistory } from '../../src/models/repository';
import app from '../../src/app';
import { question, roomId, user1, user1Token, user2, user3Token } from '../fixtures';

const chai = use(chaiHttp);

describe('History Controller', function () {
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

    describe('GET /history', function () {
        before(async function () {
            await createHistory(roomId, user1, user2, question);
        });

        it('Should return history with token', done => {
            chai.request(app)
                .get(`/api/history`)
                .set('Authorization', `Bearer ${user1Token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message');
                    expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
                    done();
                });
        });

        it('Should return empty history for different token', done => {
            chai.request(app)
                .get(`/api/history`)
                .set('Authorization', `Bearer ${user3Token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message');
                    expect(res.body.data).to.be.an('array').that.has.lengthOf(0);
                    done();
                });
        });

        it('Should return 401 without accessToken', done => {
            chai.request(app)
                .get(`/api/history`)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('message');
                    done();
                });
        });
    });
});
