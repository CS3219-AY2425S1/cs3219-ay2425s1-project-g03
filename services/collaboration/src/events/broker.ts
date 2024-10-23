import amqp, { Connection, Channel, Message } from "amqplib/callback_api";

let channel: Channel | null = null;

/**
 * Function to get or create a RabbitMQ channel
 */
export const getChannel = async (): Promise<Channel> => {
  if (!channel) {
    try {
      await new Promise<void>((resolve, reject) => {
        amqp.connect(
          process.env.RABBITMQ_URL!,
          (err: Error | null, connection: Connection) => {
            if (err) {
              console.error("RabbitMQ connection error:", err);
              reject(err);
            }
            connection.createChannel((err: Error | null, ch: Channel) => {
              if (err) {
                console.error("RabbitMQ channel creation error:", err);
                reject(err);
              }
              channel = ch;
              resolve();
            });
          },
        );
      });
    } catch (error) {
      console.error(
        "Error during RabbitMQ connection or channel creation:",
        error,
      );
      throw error;
    }
  }

  if (!channel) {
    throw new Error("Failed to create or get the RabbitMQ channel.");
  }

  return channel;
};

/**
 * Function to consume a message from a RabbitMQ queue
 * @param queue
 * @param onMessage
 */
export const consumeMessageFromQueue = async (
  queue: string,
  onMessage: (msg: Message) => void,
) => {
  try {
    const ch = await getChannel();
    ch.assertQueue(queue, { durable: true });
    ch.consume(queue, (msg: Message | null) => {
      if (msg) {
        try {
          onMessage(msg);
          ch.ack(msg);
        } catch (messageHandlingError) {
          console.error("Error handling the message:", messageHandlingError);
        }
      } else {
        console.error(`No message found in queue ${queue}`);
      }
    });
  } catch (error) {
    console.error(`Error consuming message from queue ${queue}:`, error);
  }
};
