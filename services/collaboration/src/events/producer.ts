import { CollabCreatedEvent, IdType, MatchFailedEvent, Question } from '../types/event';
import { CreateHistoryMessage, HistoryStatus, UpdateHistoryMessage, User } from '../types/message';
import messageBroker from './broker';
import { Queues } from './queues';

const COLLAB_CREATED_ERROR = 'Failed to create room';

/**
 * Produce a collab created event
 * @param requestId1
 * @param requestId2
 * @param collabId
 * @param question
 */
export async function produceCollabCreated(
    requestId1: IdType,
    requestId2: IdType,
    collabId: IdType,
    question: Question,
) {
    const message: CollabCreatedEvent = { requestId1, requestId2, collabId, question };
    await messageBroker.produce(Queues.COLLAB_CREATED, message);
}

/**
 * Produce a collab create failed event
 * @param requestId1
 * @param requestId2
 */
export async function produceCollabCreateFailedEvent(requestId1: IdType, requestId2: IdType) {
    const message: MatchFailedEvent = { requestId1, requestId2, reason: COLLAB_CREATED_ERROR };
    await messageBroker.produce(Queues.MATCH_FAILED, message);
}

/**
 * Produce a create history event
 * @param roomId
 * @param user1
 * @param user2
 * @param question
 */
export async function produceCreateHistory(roomId: IdType, user1: User, user2: User, question: Question) {
    const message: CreateHistoryMessage = { roomId, user1, user2, question };
    await messageBroker.produce(Queues.CREATE_HISTORY, message);
}

/**
 * Produce an update history event
 * @param roomId
 * @param userId
 * @param status
 */
export async function produceUpdateHistory(roomId: IdType, userId: IdType, status: HistoryStatus) {
    const message: UpdateHistoryMessage = { roomId, userId, status };
    await messageBroker.produce(Queues.UPDATE_HISTORY, message);
}
