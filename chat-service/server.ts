import { connectToRabbitMQ } from "./src/rabbitmq";
import app from "./app";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToRabbitMQ();
    app.listen(PORT, () => {
      console.log(`Chat Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Chat Service", error);
  }
};

startServer();

