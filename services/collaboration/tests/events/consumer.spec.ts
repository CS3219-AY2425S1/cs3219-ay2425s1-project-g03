import dotenv from "dotenv";
dotenv.config({path: "../../.env.sample"});
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import {
  consumeQuestionFound,
  initializeConsumers,
} from "../../src/events/consumer";
import { QuestionFoundEvent } from "../../src/types/event";
import * as roomController from "../../src/controllers/roomController";
import * as prod from "../../src/events/producer";
import messageBroker from "../../src/events/broker";
import { Queues } from "../../src/events/queues";
import { Difficulty } from "../../src/types/collab";

describe("consumeQuestionFound", () => {
  let createRoomWithQuestionStub: SinonStub;
  let produceCollabCreatedStub: SinonStub;
  let produceCollabCreateFailedEventStub: SinonStub;
  let produceCreateHistoryStub: SinonStub;

  beforeEach(() => {
    createRoomWithQuestionStub = sinon.stub(
      roomController,
      "createRoomWithQuestion",
    );
    produceCollabCreatedStub = sinon.stub(prod, "produceCollabCreated");
    produceCollabCreateFailedEventStub = sinon.stub(
      prod,
      "produceCollabCreateFailedEvent",
    );
    produceCreateHistoryStub = sinon.stub(prod, "produceCreateHistory");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create a room and produce events if room creation is successful", async () => {
    const msg: QuestionFoundEvent = {
      user1: {
        requestId: "user1",
        id: "id1",
        username: "user1",
        email: "user1@example.com",
      },
      user2: {
        requestId: "user2",
        id: "id2",
        username: "user2",
        email: "user2@example.com",
      },
      question: {
        id: 1,
        title: "Question 1",
        description: "Description 1",
        topics: ["topic1"],
        difficulty: Difficulty.Easy,
      },
    };

    const roomId = "roomId123";
    createRoomWithQuestionStub.resolves(roomId);

    await consumeQuestionFound(msg);

    expect(createRoomWithQuestionStub).to.have.been.calledWith(
      msg.user1,
      msg.user2,
      msg.question,
    );
    expect(produceCollabCreatedStub).to.have.been.calledWith(
      "user1",
      "user2",
      roomId,
      msg.question,
    );
    expect(produceCreateHistoryStub).to.have.been.calledWith(
      roomId,
      { _id: "id1", username: "user1" },
      { _id: "id2", username: "user2" },
      msg.question,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(produceCollabCreateFailedEventStub).not.to.have.been.called;
  });

  it("should produce a collab create failed event if room creation fails", async () => {
    const msg: QuestionFoundEvent = {
      user1: {
        requestId: "user1",
        id: "id1",
        username: "user1",
        email: "user1@example.com",
      },
      user2: {
        requestId: "user2",
        id: "id2",
        username: "user2",
        email: "user2@example.com",
      },
      question: {
        id: 1,
        title: "Question 1",
        description: "Description 1",
        topics: ["topic1"],
        difficulty: Difficulty.Easy,
      },
    };

    createRoomWithQuestionStub.resolves(null);

    await consumeQuestionFound(msg);

    expect(createRoomWithQuestionStub).to.have.been.calledWith(
      msg.user1,
      msg.user2,
      msg.question,
    );
    expect(produceCollabCreateFailedEventStub).to.have.been.calledWith(
      "user1",
      "user2",
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(produceCollabCreatedStub).not.to.have.been.called;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(produceCreateHistoryStub).not.to.have.been.called;
  });
});

describe("initializeConsumers", () => {
  let consumeStub: SinonStub;

  beforeEach(() => {
    consumeStub = sinon.stub(messageBroker, "consume");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should initialize consumers correctly", () => {
    initializeConsumers();

    expect(consumeStub).to.have.been.calledWith(
      Queues.QUESTION_FOUND,
      consumeQuestionFound,
    );
  });
});
