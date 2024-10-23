import { getChannel } from "./broker";

/**
 * Send message to queue
 * @param queue
 * @param message
 */
export const sendMessageToQueue = async (queue: string, message: any) => {
  try {
    const channel = await getChannel();

    console.log(`Producing message to ${queue}: ${JSON.stringify(message)}`);

    channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    console.log(`Message successfully produced to ${queue}`);
  } catch (error) {
    console.error(`Error producing message to ${queue}:`, error);
  }
};
