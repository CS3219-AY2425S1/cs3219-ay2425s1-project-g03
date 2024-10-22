import amqp, { Connection, Channel, Message } from 'amqplib/callback_api';

let channel: Channel | null = null;

/**
 * Function to get or create a RabbitMQ channel
 */
export const getChannel = async (): Promise<Channel> => {
    if (!channel) {
        await new Promise<void>((resolve, reject) => {
            amqp.connect(process.env.RABBITMQ_URL!, (err: Error | null, connection: Connection) => {
                if (err) {
                    console.error('RabbitMQ connection error:', err);
                    reject(err);
                }
                connection.createChannel((err: Error | null, ch: Channel) => {
                    if (err) {
                        console.error('RabbitMQ channel creation error:', err);
                        reject(err);
                    }
                    channel = ch;
                    resolve();
                });
            });
        });
    }

    if (!channel) {
        throw new Error("Failed to create or get the RabbitMQ channel.");
    }

    return channel;
};

/**
 * Function to consume a message from a RabbitMQ queue
 * @param queue - The queue to consume from
 * @param onMessage - Callback function to handle the message
 */
export const consumeMessageFromQueue = async (queue: string, onMessage: (msg: Message) => void) => {
    const ch = await getChannel();
    ch.assertQueue(queue, { durable: true });
    ch.consume(queue, (msg: Message | null) => {
        if (msg) {
            onMessage(msg);
            ch.ack(msg);
        } else {
            console.error(`No message found in queue ${queue}`);
        }
    });
};