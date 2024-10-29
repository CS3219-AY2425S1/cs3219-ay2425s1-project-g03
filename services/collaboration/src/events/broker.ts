import amqplib, { Channel, Connection } from 'amqplib';
import config from '../config';

class Broker {
    private connection!: Connection;
    private channel!: Channel;
    private connected = false;

    async connect(): Promise<void> {
        if (this.connection && this.channel) {
            return;
        }

        try {
            this.connection = await amqplib.connect(config.BROKER_URL);
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
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
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

            await this.channel.assertQueue(queue, { durable: true });
            await this.channel.consume(
                queue,
                msg => {
                    if (!msg) {
                        return console.error('Invalid message from queue', queue);
                    }
                    const parsedMessage = JSON.parse(msg.content.toString()) as T;
                    onMessage(parsedMessage);
                    this.channel.ack(msg);
                },
                { noAck: false },
            );
        } catch (error) {
            console.error('Failed to consume message:', error);
            throw error;
        }
    }
}

const broker = new Broker();
export default broker;
