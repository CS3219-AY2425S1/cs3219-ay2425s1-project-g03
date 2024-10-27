import { Request, Response } from "express";
import {
  createRoomInDB,
  createYjsDocument,
  deleteYjsDocument,
  findRoomById,
  findRoomsByUserId,
  closeRoomById,
  updateRoomUserStatus,
} from "../services/mongodbService";
import axios from "axios";
import {
  handleNotFound,
  handleSuccess,
  handleServerError,
  handleBadRequest,
} from "../utils/helper";
import config from "../config";

/**
 * Create a room with users, question details, and Yjs document
 * @param user1
 * @param user2
 * @param topics
 * @param difficulty
 * @returns roomId
 */
export const createRoomWithQuestion = async (
  user1: any,
  user2: any,
  topics: string[],
  difficulty: string,
) => {
  try {
    const questionServiceUrl = config.QUESTION_SERVICE_URL;
    const topicString = topics.join(",");
    const response = await axios.get(
      `${questionServiceUrl}questions/search?topics=${topicString}&difficulty=${difficulty}&limit=1`,
    );

    if (response.data && response.data.data && response.data.data.length > 0) {
      const question = response.data.data[0];

      const roomData = {
        users: [
          {
            ...user1,
            isForfeit: false,
          },
          {
            ...user2,
            isForfeit: false,
          },
        ],
        question_id: question.id,
        createdAt: new Date(),
      };

      const room_id = await createRoomInDB(roomData);
      console.log("Room created with ID:", room_id);

      await createYjsDocument(room_id.toString());
      console.log("Yjs document created for room ID:", room_id);

      return room_id;
    } else {
      console.error("No question found for the given parameters");
      return null;
    }
  } catch (error) {
    console.error("Error fetching question or creating room:", error);
    return null;
  }
};

/**
 * Controller function to get room IDs by user ID
 * @param req
 * @param res
 */
export const getRoomIdsByUserIdController = async (
  req: Request,
  res: Response,
) => {
  console.log("Received request for user ID:", req.params.userId);
  try {
    const userId = req.params.userId;

    const rooms = await findRoomsByUserId(userId);

    if (!rooms || rooms.length === 0) {
      return handleNotFound(res, "No rooms found for the given user");
    }

    const roomIds = rooms.map((room: { _id: any }) => room._id);

    return handleSuccess(res, roomIds);
  } catch (error) {
    console.error("Error fetching rooms by user ID:", error);
    return handleServerError(res, "Failed to retrieve room IDs by user ID");
  }
};

/**
 * Controller function to get room details by room ID
 * @param req
 * @param res
 */
export const getRoomByRoomIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const roomId = req.params.roomId;

    const room = await findRoomById(roomId);

    if (!room) {
      return handleNotFound(res, "Room not found");
    }

    return handleSuccess(res, {
      room_id: room._id,
      users: room.users,
      question_id: room.question_id,
      createdAt: room.createdAt,
      room_status: room.room_status,
    });
  } catch (error) {
    console.error("Error fetching room by room ID:", error);
    return handleServerError(res, "Failed to retrieve room by room ID");
  }
};

/**
 * Controller function to close a room and delete its Yjs document
 * @param req
 * @param res
 */
export const closeRoomController = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId;

    const room = await findRoomById(roomId);
    if (!room) {
      return handleNotFound(res, "Room not found");
    }

    if (!room.room_status) {
      console.log(`Room ${roomId} is already closed.`);
      return handleSuccess(res, `Room ${roomId} is already closed`);
    }

    const result = await closeRoomById(roomId);
    if (result.modifiedCount === 0) {
      return handleNotFound(res, "Room not found");
    }

    await deleteYjsDocument(roomId);
    console.log(`Room ${roomId} closed and Yjs document removed`);

    return handleSuccess(res, `Room ${roomId} successfully closed`);
  } catch (error) {
    console.error("Error closing room:", error);
    return handleServerError(res, "Failed to close room");
  }
};

/**
 * Controller function to update the status of a user in a room
 * @param req
 * @param res
 */
export const updateUserStatusInRoomController = async (
  req: Request,
  res: Response,
) => {
  const { roomId, userId } = req.params;
  const { isForfeit } = req.body;

  if (typeof isForfeit !== "boolean") {
    return handleBadRequest(
      res,
      "Invalid isForfeit value. Must be true or false.",
    );
  }

  try {
    const room = await findRoomById(roomId);
    if (!room) {
      return handleNotFound(res, "Room not found");
    }

    const updatedRoom = await updateRoomUserStatus(roomId, userId, isForfeit);

    if (!updatedRoom) {
      return handleNotFound(res, "User not found in room");
    }

    return handleSuccess(res, {
      message: "User isForfeit status updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Error updating user isForfeit status in room:", error);
    return handleServerError(
      res,
      "Failed to update user isForfeit status in room",
    );
  }
};
