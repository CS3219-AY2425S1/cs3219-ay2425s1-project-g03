import { Request, Response } from "express";
import {
  createRoomInDB,
  createYjsDocument,
  findRoomByRoomId,
  findRoomsByUserId,
} from "../services/mongodbService";
import axios from "axios";

/**
 * Create a room with users, question details, and Yjs document
 * @param user1 - First user details
 * @param user2 - Second user details
 * @param topics - List of topics
 * @param difficulty - Difficulty level
 * @returns roomId - The created room ID or null if creation fails
 */
export const createRoomWithQuestion = async (
  user1: any,
  user2: any,
  topics: string[],
  difficulty: string,
) => {
  try {
    const questionServiceUrl =
      process.env.QUESTION_SERVICE_URL || "http://question:8081/";
    const response = await axios.get(
      `${questionServiceUrl}questions/search?topics=${topics.join(",")}&difficulty=${difficulty}&limit=1`,
    );

    if (response.data && response.data.data && response.data.data.length > 0) {
      const question = response.data.data[0];

      const roomData = {
        users: [user1, user2],
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
      return res
        .status(404)
        .json({ error: "No rooms found for the given user" });
    }

    const roomIds = rooms.map((room: { _id: any }) => room._id);

    return res.status(200).json(roomIds);
  } catch (error) {
    console.error("Error fetching rooms by user ID:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve room IDs by user ID" });
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

    const room = await findRoomByRoomId(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.status(200).json({
      room_id: room._id,
      users: room.users,
      question_id: room.question_id,
      createdAt: room.createdAt,
    });
  } catch (error) {
    console.error("Error fetching room by room ID:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve room by room ID" });
  }
};
