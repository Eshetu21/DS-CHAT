import amqp from "amqplib";
import { handleNewMessageEvent } from "./userUtils";

let channel: amqp.Channel;

export const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertExchange("chat_exchange", "fanout", { durable: true });
    const q = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(q.queue, "chat_exchange", "");

    channel.consume(q.queue, (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        handleNewMessageEvent(event);
      }
    });

    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("RabbitMQ Connection Failed", error);
  }
};

