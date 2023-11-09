import mongoose from "mongoose";
import app from "./app.js";
import "dotenv/config";

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('Data base connection established'))
  .catch((err) => console.log(err));

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log("listening on port " + port);
});