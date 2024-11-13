import { createHistory, updateHistory } from '../models/repository';
import { CreateHistoryMessage, UpdateHistoryMessage } from '../types/message';
import messageBroker from './broker';
import { Queues } from './queues';

async function consumeCreateHistory(msg: CreateHistoryMessage) {
    console.log('Processing CreateHistoryMessage:', msg);
    const { roomId, user1, user2, question } = msg;

    try {
        await createHistory(roomId, user1, user2, question);
    } catch (error) {
        console.log('Unable to add history:', error);
    } finally {
        console.log('Successfully created history');
    }
}

async function consumeUpdateHistory(msg: UpdateHistoryMessage) {
    console.log('Processing UpdateHistoryMessage:', msg);
    const { roomId, userId, status, snapshot } = msg;

    try {
        await updateHistory(roomId, userId, status, snapshot);
    } catch (error) {
        console.log('Unable to add history:', error);
    }
}

export async function initializeConsumers() {
    messageBroker.consume(Queues.CREATE_HISTORY, consumeCreateHistory);
    messageBroker.consume(Queues.UPDATE_HISTORY, consumeUpdateHistory);
}
