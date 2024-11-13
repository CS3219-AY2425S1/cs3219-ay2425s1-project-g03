import dotenv from "dotenv";
dotenv.config({ path: "../../.env.sample" });
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import {
  produceCollabCreated,
  produceCollabCreateFailedEvent,
  produceCreateHistory,
  produceUpdateHistory,
} from "../../src/events/producer";
import messageBroker from "../../src/events/broker";
import { Queues } from "../../src/events/queues";
import {
  Question,
  IdType,
  CollabCreatedEvent,
  MatchFailedEvent,
  Difficulty,
} from "../../src/types/event";
import { CreateHistoryMessage } from "../../src/types/message";
import { User } from "../../src/types/message";

describe("Producer Tests", () => {
  let produceStub: SinonStub;

  beforeEach(() => {
    produceStub = sinon.stub(messageBroker, "produce");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("produceCollabCreated", () => {
    it("should produce a collab created event", async () => {
      const requestId1: IdType = "request1";
      const requestId2: IdType = "request2";
      const collabId: IdType = "collab1";
      const question: Question = {
        id: 1,
        title: "Question 1",
        description: "Description 1",
        topics: ["topic1"],
        difficulty: Difficulty.Easy,
      };

      const expectedMessage: CollabCreatedEvent = {
        requestId1,
        requestId2,
        collabId,
        question,
      };

      await produceCollabCreated(requestId1, requestId2, collabId, question);

      expect(produceStub).to.have.been.calledWith(
        Queues.COLLAB_CREATED,
        expectedMessage,
      );
    });
  });

  describe("produceCollabCreateFailedEvent", () => {
    it("should produce a collab create failed event", async () => {
      const requestId1: IdType = "request1";
      const requestId2: IdType = "request2";
      const expectedMessage: MatchFailedEvent = {
        requestId1,
        requestId2,
        reason: "Failed to create room",
      };

      await produceCollabCreateFailedEvent(requestId1, requestId2);

      expect(produceStub).to.have.been.calledWith(
        Queues.MATCH_FAILED,
        expectedMessage,
      );
    });
  });

  describe("produceCreateHistory", () => {
    it("should produce a create history event", async () => {
      const roomId: IdType = "room1";
      const user1: User = {
        _id: "id1",
        username: "user1",
      };
      const user2: User = {
        _id: "id2",
        username: "user2",
      };
      const question: Question = {
        id: 1,
        title: "Question 1",
        description: "Description 1",
        topics: ["topic1"],
        difficulty: Difficulty.Easy,
      };

      const expectedMessage: CreateHistoryMessage = {
        roomId,
        user1,
        user2,
        question,
      };

      await produceCreateHistory(roomId, user1, user2, question);

      expect(produceStub).to.have.been.calledWith(
        Queues.CREATE_HISTORY,
        expectedMessage,
      );
    });
  });
});
