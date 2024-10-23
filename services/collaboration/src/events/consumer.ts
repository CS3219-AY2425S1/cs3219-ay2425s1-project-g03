import { Queues } from "./queues";
import { getChannel } from "./broker";
import { createRoomWithQuestion } from "../controllers/roomController";
import { sendMessageToQueue } from "./producer";

/**
 * Function to initialize the room consumer
 */
export async function initializeRoomConsumer() {
  const channel = await getChannel();

  channel.assertQueue(Queues.MATCH_FOUND, { durable: true });

  channel.consume(Queues.MATCH_FOUND, async (msg: any) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());

      console.log(
        `Message consumed from MATCH_FOUND queue: ${JSON.stringify(content)}`,
      );

      const { user1, user2, topics, difficulty } = content;

      const { id: user1Id, requestId: requestId1 } = user1;
      const { id: user2Id, requestId: requestId2 } = user2;

      const roomId = await createRoomWithQuestion(
        user1,
        user2,
        topics,
        difficulty,
      );

      if (roomId) {
        console.log(`Room created successfully with ID: ${roomId}`);

        const collabCreatedMessage = {
          requestId1,
          requestId2,
          collabId: roomId,
        };

        console.log(
          `Message to be produced to COLLAB_CREATED queue: ${JSON.stringify(collabCreatedMessage)}`,
        );

        await sendMessageToQueue(Queues.COLLAB_CREATED, collabCreatedMessage);

        console.log(
          `Message sent to COLLAB_CREATED queue: ${JSON.stringify(collabCreatedMessage)}`,
        );
      } else {
        console.log("Failed to create room.");
      }

      channel.ack(msg);
    }
  });
}