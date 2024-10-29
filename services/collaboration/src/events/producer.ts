import Broker from './broker';

/**
 * Send message to queue
 * @param queue
 * @param message
 */
export const sendMessageToQueue = async (queue: string, message: any) => {
    try {
        console.log(`Producing message to ${queue}: ${JSON.stringify(message)}`);

        await Broker.produce(queue, message);

        console.log(`Message successfully produced to ${queue}`);
    } catch (error) {
        console.error(`Error producing message to ${queue}:`, error);
    }
};
