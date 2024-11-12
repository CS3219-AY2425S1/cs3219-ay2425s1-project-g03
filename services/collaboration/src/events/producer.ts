import { CollabCreatedEvent, IdType, MatchFailedEvent, Question } from '../types/event';
import { CreateHistoryMessage, HistoryStatus, Snapshot, UpdateHistoryMessage, User } from '../types/message';
import messageBroker from './broker';
import { Queues } from './queues';

const COLLAB_CREATED_ERROR = 'Failed to create room';

export async function produceCollabCreated(
    requestId1: IdType,
    requestId2: IdType,
    collabId: IdType,
    question: Question,
) {
    const message: CollabCreatedEvent = { requestId1, requestId2, collabId, question };
    await messageBroker.produce(Queues.COLLAB_CREATED, message);
}

export async function produceCollabCreateFailedEvent(requestId1: IdType, requestId2: IdType) {
    const message: MatchFailedEvent = { requestId1, requestId2, reason: COLLAB_CREATED_ERROR };
    await messageBroker.produce(Queues.MATCH_FAILED, message);
}

export async function produceCreateHistory(roomId: IdType, user1: User, user2: User, question: Question) {
    const message: CreateHistoryMessage = { roomId, user1, user2, question };
    await messageBroker.produce(Queues.CREATE_HISTORY, message);
}

export async function produceUpdateHistory(roomId: IdType, userId: IdType, status: HistoryStatus, snapshot: Snapshot) {
    const message: UpdateHistoryMessage = { roomId, userId, status, snapshot };
    await messageBroker.produce(Queues.UPDATE_HISTORY, message);
}
