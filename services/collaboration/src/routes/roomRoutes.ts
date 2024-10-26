import { Router } from "express";
import {
  getRoomIdsByUserIdController,
  getRoomByRoomIdController,
  closeRoomController,
  updateUserStatusInRoomController,
} from "../controllers/roomController";

/**
 * Router for room endpoints.
 */
const router = Router();

/**
 * Get room IDs by user ID
 */
router.get("/user/:userId", getRoomIdsByUserIdController);

/**
 * Get room by room ID
 */
router.get("/:roomId", getRoomByRoomIdController);

/**
 * Close room by room ID
 */
router.patch("/:roomId/close", closeRoomController);

/**
 * Update user status in a room
 */
router.patch(
  "/roomToEdit/:roomId/user/:userId/isForfeit",
  updateUserStatusInRoomController,
);

export default router;
