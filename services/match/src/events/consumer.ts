import {
    findAndAssignCollab,
    findAndMarkError,
    findMatchRequestAndAssignPair,
    findMatchRequestByIdAndAssignPair,
} from '../models/repository';
import { CollabCreatedEvent, MatchFailedEvent, MatchUpdatedEvent } from '../types/event';
import { logQueueStatus } from '../utils/logger';
import messageBroker from './broker';
import { produceMatchFound } from './producer';
import { Queues } from './queues';

function findCommonTopics(topics1: string[], topics2: string[]) {
    return topics1.filter(topic => topics2.includes(topic));
}

async function consumeMatchUpdated(msg: MatchUpdatedEvent) {
    const {
        user: { id: userId, username, requestId },
        topics,
        difficulty,
    } = msg;

    console.log('Attempting to find match for user', username);
    await logQueueStatus();

    const match = await findMatchRequestAndAssignPair(requestId, userId, topics, difficulty);

    if (!match) {
        console.log('Unable to find match for user', username);
        await logQueueStatus();
        return;
    }
    await findMatchRequestByIdAndAssignPair(requestId, match.id);

    console.log('Succesfully found match for user', username);
    await logQueueStatus();

    const user1 = { id: userId, username, requestId };
    const user2 = { id: match.userId, username: match.username, requestId: match.id };
    const commonTopics = findCommonTopics(topics, match.topics);
    await produceMatchFound(user1, user2, commonTopics, difficulty);
}

async function consumeCollabCreated(msg: CollabCreatedEvent) {
    const { requestId1, requestId2, collabId } = msg;
    // Remember remove this console.log after debugging is done.
    console.log(msg);
    await findAndAssignCollab(requestId1, requestId2, collabId);
}

async function consumeMatchFailed(msg: MatchFailedEvent) {
    console.log('Processing MatchFailedEvent:', msg);
    const { requestId1, requestId2 } = msg;
    await findAndMarkError(requestId1, requestId2);
}

export async function initializeConsumers() {
    messageBroker.consume(Queues.MATCH_REQUEST_UPDATED, consumeMatchUpdated);
    messageBroker.consume(Queues.COLLAB_CREATED, consumeCollabCreated);
    messageBroker.consume(Queues.MATCH_FAILED, consumeMatchFailed);
}
