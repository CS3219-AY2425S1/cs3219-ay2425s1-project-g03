import { MatchRequestModel } from '../models/matchRequestModel';
import { CollabCreatedEvent, MatchUpdatedEvent } from '../types/event';
import { oneMinuteAgo } from '../utils/date';
import messageBroker from './broker';
import { produceMatchFound } from './producer';
import { Queues } from './queues';

async function consumeMatchUpdated(msg: MatchUpdatedEvent) {
    const {
        user: { id: userId, username, requestId },
        topics,
        difficulty,
    } = msg;

    const match = await MatchRequestModel.findOneAndUpdate(
        {
            _id: { $ne: requestId },
            userId: { $ne: userId },
            pairId: null,
            topics: { $in: topics },
            difficulty,
            updatedAt: { $gte: oneMinuteAgo() },
        },
        { $set: { pairId: requestId } },
    );

    if (!match) return;
    await MatchRequestModel.findByIdAndUpdate(requestId, { $set: { pairId: match.id } });

    const user1 = { id: userId, username, requestId };
    const user2 = { id: match.userId, username: match.username, requestId: match.id };
    const commonTopics = topics.filter(topic => match.topics.includes(topic));
    await produceMatchFound(user1, user2, commonTopics, difficulty);
}

async function consumeCollabCreated(msg: CollabCreatedEvent) {
    const { requestId1, requestId2, collabId } = msg;
    await MatchRequestModel.updateMany({ _id: { $in: [requestId1, requestId2] } }, { $set: { collabId } });
}

export async function initializeConsumers() {
    messageBroker.consume(Queues.MATCH_REQUEST_UPDATED, consumeMatchUpdated);
    messageBroker.consume(Queues.COLLAB_CREATED, consumeCollabCreated);
}
