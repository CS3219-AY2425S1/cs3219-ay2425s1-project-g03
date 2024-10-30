import { Queues } from './queues';
import messageBroker from './broker';
import { createRoomWithQuestion } from '../controllers/roomController';
import { QuestionFoundEvent } from '../types/event';
import { produceCollabCreated, produceCollabCreateFailedEvent } from './producer';

async function consumeQuestionFound(message: QuestionFoundEvent) {
    console.log('Attempting to create room:', message);
    const { user1, user2, question } = message;

    const { requestId: requestId1 } = user1;
    const { requestId: requestId2 } = user2;

    const roomId = await createRoomWithQuestion(user1, user2, question);
    if (roomId) {
        console.log('Room created with ID:', message, roomId);
        await produceCollabCreated(requestId1, requestId2, roomId, question);
    } else {
        console.log('Failed to create room:', message);
        await produceCollabCreateFailedEvent(requestId1, requestId2);
    }
}

export async function initializeConsumers() {
    messageBroker.consume(Queues.QUESTION_FOUND, consumeQuestionFound);
}
