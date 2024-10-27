import amqp, { Connection, Channel } from "amqplib/callback_api";
import config from "../config";

let channel: Channel | null = null;
let connection: Connection | null = null;

/**
 * Function to connect to an existing RabbitMQ channel via RABBITMQ_URL
 */
export const getChannel = async (): Promise<Channel> => {
  if (!channel) {
    try {
      await new Promise<void>((resolve, reject) => {
        amqp.connect(config.BROKER_URL, (err, conn) => {
          if (err) {
            console.error("RabbitMQ connection error:", err);
            return reject(err);
          }

          connection = conn;

          conn.createChannel((err, ch) => {
            if (err) {
              console.error("RabbitMQ channel creation error:", err);
              return reject(err);
            }
            channel = ch;
            resolve();
          });
        });
      });
    } catch (error) {
      console.error(
        "Error during RabbitMQ connection or channel access:",
        error,
      );
      throw error;
    }
  }

  if (!channel) {
    throw new Error("Failed to get the RabbitMQ channel.");
  }

  return channel;
};

/**
 * Function to consume a message from a RabbitMQ queue
 * @param queue
 * @param onMessage
 */
export const consumeMessageFromQueue = async <T>(
  queue: string,
  onMessage: (message: T) => void,
): Promise<void> => {
  try {
    const ch = await getChannel();

    ch.assertQueue(queue, { durable: true });

    ch.consume(
      queue,
      (msg) => {
        if (!msg) {
          return console.error(`No message found in queue ${queue}`);
        }

        try {
          const parsedMessage = JSON.parse(msg.content.toString()) as T;
          onMessage(parsedMessage);
          ch.ack(msg);
        } catch (error) {
          console.error("Error handling the message:", error);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error(`Failed to consume message from queue ${queue}:`, error);
    throw error;
  }
};
