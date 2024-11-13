import client, { Channel, Connection } from 'amqplib';
import config from '../config';

/**
 * Adapted from
 * https://hassanfouad.medium.com/using-rabbitmq-with-nodejs-and-typescript-8b33d56a62cc
 */
class MessageBroker {
    connection: Connection | undefined;
    channel: Channel | undefined;
    private connected = false;

    async connect(): Promise<void> {
        if (this.connection && this.channel) {
            return;
        }

        try {
            this.connection = await client.connect(config.BROKER_URL);
            console.log('Connected to RabbitMQ');
            this.channel = await this.connection.createChannel();
            this.connected = true;
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    async produce(queue: string, message: any): Promise<void> {
        try {
            if (!this.connected) {
                await this.connect();
            }

            if (this.channel) {
                this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
            } else {
                throw new Error('Channel is not initialized');
            }
        } catch (error) {
            console.error('Failed to produce message:', error);
            throw error;
        }
    }

    async consume<T>(queue: string, onMessage: (message: T) => void): Promise<void> {
        try {
            if (!this.connected) {
                await this.connect();
            }

            if (this.channel) {
                await this.channel.assertQueue(queue, { durable: true });
            } else {
                throw new Error('Channel is not initialized');
            }

            this.channel.consume(
                queue,
                msg => {
                    if (!msg) return console.error('Invalid message from queue', queue);

                    onMessage(JSON.parse(msg.content.toString()) as T);
                    if (this.channel) {
                        this.channel.ack(msg);
                    } else {
                        console.error('Channel is not initialized');
                    }
                },
                { noAck: false },
            );
        } catch (error) {
            console.error('Failed to consume message:', error);
            throw error;
        }
    }
}

const messageBroker = new MessageBroker();
export default messageBroker;
