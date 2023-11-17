import express from "express"
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

//Routes
import { router as usersRoutes } from "./routes/userRoutes.js";
import { router as articlesRoutes } from "./routes/articleRoutes.js";
import { router as featuresRoutes } from "./routes/featuresRoutes.js";
import {router as messageRoutes} from "./routes/messageRoutes.js";

//Controllers
import { globalErrorHandler } from "./controllers/ErrorController.js";

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", socket => {
  let timeout;
  socket.on("join-chat", (chatId) => {
    socket.join(chatId);

    socket.to(chatId).emit("chat-open", "El otro usuario abrio el chat");
  })

  socket.on("new-message", chatId => {
    socket.to(chatId).emit("new-message", "You received a new message")
  })

  socket.on("chatReaded", data => {
    clearTimeout(timeout);

    timeout = setTimeout(
      () => socket.broadcast.emit("chatReaded", "The other user has been readed your messages"),
      1000
    );
    
  })
})

app.use(cors());
app.options("*", cors());

app.use(express.json({limit: "10kb"}));

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/articles", articlesRoutes);
app.use("/api/v1/features", featuresRoutes);
app.use("/api/v1/messages", messageRoutes);
app.all("*", (req, res, next) => {
  next(new Error("URL not found"))
})

app.use(globalErrorHandler);

export default server;