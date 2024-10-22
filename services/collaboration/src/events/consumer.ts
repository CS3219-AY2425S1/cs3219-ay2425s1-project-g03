import { Queues } from './queues';
import { getChannel } from './broker';
import { createRoomWithQuestion } from '../controllers/roomController';

/**
 * Function to initialize the room consumer
 */
export async function initializeRoomConsumer() {
    const channel = await getChannel();

    channel.assertQueue(Queues.MATCH_FOUND, { durable: true });

    channel.consume(Queues.MATCH_FOUND, async (msg: any) => {
        if (msg) {
            const content = JSON.parse(msg.content.toString());

            const { user1, user2, topics, difficulty } = content;

            const roomId = await createRoomWithQuestion(user1, user2, topics, difficulty);

            if (roomId) {
                console.log(`Room created successfully with ID: ${roomId}`);
            } else {
                console.log('Failed to create room.');
            }

            channel.ack(msg);
        }
    });
}