import amqp from "amqplib";

let channel: amqp.Channel;

export const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://127.0.0.1");

    channel = await connection.createChannel();
    await channel.assertExchange("chat_exchange", "fanout", { durable: true });
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
  }
};

export const publishMessage = async (message: any) => {
  try {
    if (!channel) throw new Error("RabbitMQ channel is not initialized");
    channel.publish("chat_exchange", "", Buffer.from(JSON.stringify(message)));
    console.log("Message published to RabbitMQ:", message);
  } catch (error) {
    console.error("Failed to publish message:", error);
  }
};

