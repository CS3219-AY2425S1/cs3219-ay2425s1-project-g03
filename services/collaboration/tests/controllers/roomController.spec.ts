import chai, { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import sinonChai from "sinon-chai";
import {
  createRoomWithQuestion,
  getRoomByRoomIdController,
  closeRoomController,
} from "../../src/controllers/roomController";
import { Request, Response } from "express";
import * as mongodbService from "../../src/services/mongodbService";
import { Room, Question, Difficulty } from "../../src/types/collab";
import * as helper from "../../src/utils/helper";
import { ObjectId } from "mongodb";
import { RequestUser } from "../../src/middleware/request";

chai.use(sinonChai);

interface CustomRequest extends Request {
  user: RequestUser;
}

describe("createRoomWithQuestion", () => {
  let createRoomInDBStub: SinonStub;
  let createYjsDocumentStub: SinonStub;

  beforeEach(() => {
    createRoomInDBStub = sinon.stub(mongodbService, "createRoomInDB");
    createYjsDocumentStub = sinon.stub(mongodbService, "createYjsDocument");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create a room and Yjs document successfully", async () => {
    const user1 = { id: "user1" };
    const user2 = { id: "user2" };
    const question: Question = {
      id: 1,
      description: "Sample description",
      difficulty: Difficulty.Easy,
      title: "Sample title",
    };
    const roomId = "roomId123";

    createRoomInDBStub.resolves(roomId);
    createYjsDocumentStub.resolves();

    const result = await createRoomWithQuestion(user1, user2, question);

    expect(createRoomInDBStub).to.have.been.calledWith(user1, user2, question);
    expect(createYjsDocumentStub).to.have.been.calledWith(roomId);
    expect(result).to.equal(roomId);
  });

  it("should return null if creating room in DB fails", async () => {
    const user1 = { id: "user1" };
    const user2 = { id: "user2" };
    const question: Question = {
      id: 1,
      description: "Sample description",
      difficulty: Difficulty.Easy,
      title: "Sample title",
    };

    createRoomInDBStub.rejects(new Error("DB error"));

    const result = await createRoomWithQuestion(user1, user2, question);

    expect(createRoomInDBStub).to.have.been.calledWith(user1, user2, question);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.null;
  });

  it("should return null if creating Yjs document fails", async () => {
    const user1 = { id: "user1" };
    const user2 = { id: "user2" };
    const question: Question = {
      id: 1,
      description: "Sample description",
      difficulty: Difficulty.Easy,
      title: "Sample title",
    };
    const roomId = "roomId123";

    createRoomInDBStub.resolves(roomId);
    createYjsDocumentStub.rejects(new Error("Yjs error"));

    const result = await createRoomWithQuestion(user1, user2, question);

    expect(createRoomInDBStub).to.have.been.calledWith(user1, user2, question);
    expect(createYjsDocumentStub).to.have.been.calledWith(roomId);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.null;
  });
});

describe("getRoomByRoomIdController", () => {
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let findRoomByIdStub: SinonStub;
  let handleHttpNotFoundStub: SinonStub;
  let handleHttpSuccessStub: SinonStub;
  let handleHttpServerErrorStub: SinonStub;

  beforeEach(() => {
    req = {
      params: { roomId: "roomId123" },
      user: {
        id: "userId123",
        username: "user123",
        role: "admin",
      } as RequestUser,
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    findRoomByIdStub = sinon.stub(mongodbService, "findRoomById");
    handleHttpNotFoundStub = sinon.stub(helper, "handleHttpNotFound");
    handleHttpSuccessStub = sinon.stub(helper, "handleHttpSuccess");
    handleHttpServerErrorStub = sinon.stub(helper, "handleHttpServerError");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return room details successfully", async () => {
    const room: Room = {
      _id: new ObjectId(),
      users: [
        { id: "userId123", username: "user1", requestId: "req1" },
        { id: "userId456", username: "user2", requestId: "req2" },
      ],
      question: {
        id: 1,
        description: "Sample description",
        difficulty: Difficulty.Easy,
        title: "Sample title",
      },
      createdAt: new Date(),
      room_status: true,
    };

    findRoomByIdStub.resolves(room);

    await getRoomByRoomIdController(req as Request, res as Response);

    expect(findRoomByIdStub).to.have.been.calledWith("roomId123", "userId123");
    expect(handleHttpSuccessStub).to.have.been.calledWith(res, {
      room_id: room._id,
      users: room.users,
      question: room.question,
      createdAt: room.createdAt,
      room_status: room.room_status,
    });
  });

  it("should return 404 if room is not found", async () => {
    findRoomByIdStub.resolves(null);

    await getRoomByRoomIdController(req as Request, res as Response);

    expect(findRoomByIdStub).to.have.been.calledWith("roomId123", "userId123");
    expect(handleHttpNotFoundStub).to.have.been.calledWith(
      res,
      "Room not found",
    );
  });

  it("should handle server error", async () => {
    findRoomByIdStub.rejects(new Error("DB error"));

    await getRoomByRoomIdController(req as Request, res as Response);

    expect(findRoomByIdStub).to.have.been.calledWith("roomId123", "userId123");
    expect(handleHttpServerErrorStub).to.have.been.calledWith(
      res,
      "Failed to retrieve room by room ID",
    );
  });
});

describe("closeRoomController", () => {
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let findRoomByIdStub: SinonStub;
  let closeRoomByIdStub: SinonStub;
  let retrieveSnapshotStub: SinonStub;
  let deleteYjsDocumentStub: SinonStub;
  let handleHttpNotFoundStub: SinonStub;
  let handleHttpSuccessStub: SinonStub;
  let handleHttpServerErrorStub: SinonStub;

  beforeEach(() => {
    req = {
      params: { roomId: "roomId123" },
      user: {
        id: "userId123",
        username: "user123",
        role: "admin",
      } as RequestUser,
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    findRoomByIdStub = sinon.stub(mongodbService, "findRoomById");
    closeRoomByIdStub = sinon.stub(mongodbService, "closeRoomById");
    retrieveSnapshotStub = sinon.stub(mongodbService, "retrieveSnapshot");
    deleteYjsDocumentStub = sinon.stub(mongodbService, "deleteYjsDocument");
    handleHttpNotFoundStub = sinon.stub(helper, "handleHttpNotFound");
    handleHttpSuccessStub = sinon.stub(helper, "handleHttpSuccess");
    handleHttpServerErrorStub = sinon.stub(helper, "handleHttpServerError");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should close the room and delete its Yjs document successfully", async () => {
    const room = {
      _id: "roomId123",
      room_status: true,
      users: [],
      question: {},
      createdAt: new Date(),
    };

    findRoomByIdStub.resolves(room);
    closeRoomByIdStub.resolves({ modifiedCount: 1 });
    retrieveSnapshotStub.resolves({});
    deleteYjsDocumentStub.resolves();

    await closeRoomController(req as Request, res as Response);

    expect(findRoomByIdStub).to.have.been.calledWith("roomId123", "userId123");
    expect(closeRoomByIdStub).to.have.been.calledWith("roomId123");
    expect(retrieveSnapshotStub).to.have.been.calledWith("roomId123");
    expect(deleteYjsDocumentStub).to.have.been.calledWith("roomId123");
    expect(handleHttpSuccessStub).to.have.been.calledWith(
      res,
      "Room roomId123 successfully closed",
    );
  });

  it("should return 404 if room is not found", async () => {
    findRoomByIdStub.resolves(null);

    await closeRoomController(req as Request, res as Response);

    expect(findRoomByIdStub).to.have.been.calledWith("roomId123", "userId123");
    expect(handleHttpNotFoundStub).to.have.been.calledWith(
      res,
      "Room not found",
    );
  });

  it("should return 404 if room is already closed", async () => {
    const room = {
      _id: "roomId123",
      room_status: false,
      users: [],
      question: {},
      createdAt: new Date(),
    };

    findRoomByIdStub.resolves(room);

    await closeRoomController(req as Request, res as Response);

    expect(findRoomByIdStub).to.have.been.calledWith("roomId123", "userId123");
    expect(handleHttpSuccessStub).to.have.been.calledWith(
      res,
      "Room roomId123 is already closed",
    );
  });

  it("should handle server error", async () => {
    findRoomByIdStub.rejects(new Error("DB error"));

    await closeRoomController(req as Request, res as Response);

    expect(findRoomByIdStub).to.have.been.calledWith("roomId123", "userId123");
    expect(handleHttpServerErrorStub).to.have.been.calledWith(
      res,
      "Failed to close room",
    );
  });

  it("should return 404 if closing room in DB fails", async () => {
    const room = {
      _id: "roomId123",
      room_status: true,
      users: [],
      question: {},
      createdAt: new Date(),
    };

    findRoomByIdStub.resolves(room);
    closeRoomByIdStub.resolves({ modifiedCount: 0 });

    await closeRoomController(req as Request, res as Response);

    expect(findRoomByIdStub).to.have.been.calledWith("roomId123", "userId123");
    expect(closeRoomByIdStub).to.have.been.calledWith("roomId123");
    expect(handleHttpNotFoundStub).to.have.been.calledWith(
      res,
      "Room not found",
    );
  });
});
