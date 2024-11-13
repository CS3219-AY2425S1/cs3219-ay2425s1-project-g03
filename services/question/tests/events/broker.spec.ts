// import dotenv from 'dotenv';
// dotenv.config({ path: '../../.env.sample' });
// import { expect } from 'chai';
// import sinon, { SinonStub } from 'sinon';
// import client, { Channel, Connection } from 'amqplib';
// import messageBroker from '../../src/events/broker';
// import config from '../../src/config';

// describe('MessageBroker', () => {
//     let connectStub: SinonStub;
//     let assertQueueStub: SinonStub;
//     let sendToQueueStub: SinonStub;
//     let consumeStub: SinonStub;
//     let ackStub: SinonStub;
//     let connection: Connection;
//     let channel: Channel;

//     beforeEach(() => {
//         connection = {
//             createChannel: sinon.stub(),
//             close: sinon.stub(),
//         } as unknown as Connection;

//         channel = {
//             assertQueue: sinon.stub(),
//             sendToQueue: sinon.stub(),
//             consume: sinon.stub(),
//             ack: sinon.stub(),
//         } as unknown as Channel;

//         connectStub = sinon.stub(client, 'connect').resolves(connection);
//         (connection.createChannel as SinonStub).resolves(channel);
//         assertQueueStub = channel.assertQueue as SinonStub;
//         sendToQueueStub = channel.sendToQueue as SinonStub;
//         consumeStub = channel.consume as SinonStub;
//         ackStub = channel.ack as SinonStub;

//         messageBroker['connected'] = false;
//         messageBroker['connection'] = undefined;
//         messageBroker['channel'] = undefined;
//     });

//     afterEach(() => {
//         sinon.restore();
//     });

//     describe('connect', () => {
//         it('should connect to RabbitMQ', async () => {
//             await messageBroker.connect();

//             expect(connectStub).to.have.been.calledWith(config.BROKER_URL);
//             // eslint-disable-next-line @typescript-eslint/no-unused-expressions
//             expect(connection.createChannel).to.have.been.called;
//             // eslint-disable-next-line @typescript-eslint/no-unused-expressions
//             expect(messageBroker['connected']).to.be.true;
//         });

//         it('should not reconnect if already connected', async () => {
//             messageBroker['connection'] = connection;
//             messageBroker['channel'] = channel;
//             messageBroker['connected'] = true;

//             await messageBroker.connect();

//             // eslint-disable-next-line @typescript-eslint/no-unused-expressions
//             expect(connectStub).not.to.have.been.called;
//             // eslint-disable-next-line @typescript-eslint/no-unused-expressions
//             expect(connection.createChannel).not.to.have.been.called;
//         });

//         it('should throw an error if connection fails', async () => {
//             connectStub.rejects(new Error('Connection error'));

//             try {
//                 await messageBroker.connect();
//             } catch (error) {
//                 if (error instanceof Error) {
//                     expect(error.message).to.equal('Connection error');
//                 }
//             }
//         });
//     });

//     describe('produce', () => {
//         it('should produce a message to the queue', async () => {
//             await messageBroker.produce('testQueue', { test: 'message' });

//             // eslint-disable-next-line @typescript-eslint/no-unused-expressions
//             expect(connectStub).to.have.been.called;
//             expect(sendToQueueStub).to.have.been.calledWith(
//                 'testQueue',
//                 Buffer.from(JSON.stringify({ test: 'message' })),
//             );
//         });

//         it('should throw an error if producing message fails', async () => {
//             sendToQueueStub.rejects(new Error('Produce error'));

//             try {
//                 await messageBroker.produce('testQueue', { test: 'message' });
//             } catch (error) {
//                 if (error instanceof Error) {
//                     expect(error.message).to.equal('Produce error');
//                 }
//             }
//         });
//     });

//     describe('consume', () => {
//         it('should consume messages from the queue', async () => {
//             const onMessage = sinon.stub();
//             const msg = { content: Buffer.from(JSON.stringify({ test: 'message' })) };

//             consumeStub.yields(msg);

//             await messageBroker.consume('testQueue', onMessage);

//             // eslint-disable-next-line @typescript-eslint/no-unused-expressions
//             expect(connectStub).to.have.been.called;
//             expect(assertQueueStub).to.have.been.calledWith('testQueue', { durable: true });
//             expect(consumeStub).to.have.been.calledWith('testQueue', sinon.match.func, { noAck: false });
//             expect(onMessage).to.have.been.calledWith({ test: 'message' });
//             expect(ackStub).to.have.been.calledWith(msg);
//         });

//         it('should throw an error if consuming message fails', async () => {
//             consumeStub.rejects(new Error('Consume error'));

//             try {
//                 await messageBroker.consume('testQueue', sinon.stub());
//             } catch (error) {
//                 if (error instanceof Error) {
//                     expect(error.message).to.equal('Consume error');
//                 }
//             }
//         });
//     });
// });
