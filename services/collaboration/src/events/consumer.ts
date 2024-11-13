import { Queues } from './queues';
import messageBroker from './broker';
import { createRoomWithQuestion } from '../controllers/roomController';
import { QuestionFoundEvent } from '../types/event';
import { produceCollabCreated, produceCollabCreateFailedEvent, produceCreateHistory } from './producer';

/**
 * Consume the question found event and create a room
 * @param message
 */
async function consumeQuestionFound(message: QuestionFoundEvent) {
    console.log('Attempting to create room:', message);
    const { user1, user2, question } = message;

    const { requestId: requestId1 } = user1;
    const { requestId: requestId2 } = user2;

    const roomId = await createRoomWithQuestion(user1, user2, question);
    if (roomId) {
        console.log('Room created with ID:', message, roomId);
        await produceCollabCreated(requestId1, requestId2, roomId, question);
        await produceCreateHistory(
            roomId,
            { _id: user1.id, username: user1.username },
            { _id: user2.id, username: user2.username },
            question,
        );
    } else {
        console.log('Failed to create room:', message);
        await produceCollabCreateFailedEvent(requestId1, requestId2);
    }
}

/**
 * Initialize the consumers for the collaboration service
 */
export async function initializeConsumers() {
    messageBroker.consume(Queues.QUESTION_FOUND, consumeQuestionFound);
}
