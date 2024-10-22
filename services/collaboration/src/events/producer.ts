import { getChannel } from './broker';

/**
 * Send message to queue
 * @param queue
 * @param message
 */
export const sendMessageToQueue = async (queue: string, message: any) => {
    const channel = await getChannel();
    channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
};