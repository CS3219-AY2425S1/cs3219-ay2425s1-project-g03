import { MatchRequest } from '../models/matchRequestModel';
import { retrieveAllMatchRequests } from '../models/repository';

export async function logQueueStatus(): Promise<void> {
    const currentRequests = (await retrieveAllMatchRequests()) as MatchRequest[];
    const queueStatus = currentRequests.map(r => ({
        username: r.username,
        topics: r.topics,
        difficulty: r.difficulty,
        updatedAt: r.updatedAt,
    }));

    console.log('Current Queue Status:', queueStatus);
}
