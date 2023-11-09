import express from "express"

//Routes
import { router as usersRoutes } from "./routes/userRoutes.js";
import { router as articlesRoutes } from "./routes/articleRoutes.js";
import { router as featuresRoutes } from "./routes/featuresRoutes.js";
import { router as messageRoutes } from "./routes/messageRoutes.js";

//Controllers
import { globalErrorHandler } from "./controllers/ErrorController.js";

const app = express();

app.use(express.json({limit: "10kb"}));

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/articles", articlesRoutes);
app.use("/api/v1/features", featuresRoutes);
app.use("/api/v1/messages", messageRoutes);
app.all("*", (req, res, next) => {
  next(new Error("URL not found"))
})

app.use(globalErrorHandler);

export default app;