import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  io.on("send_message", (data) => {
    io.to(data.receiver_id).emit("receive_message", data);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

httpServer.listen(5002, () => {
  console.log("Websocket Service running on port 5002");
});

