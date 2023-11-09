import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  name: String, 
  image: String,
  author: mongoose.Schema.ObjectId,
  resume: String, 
  discipline: String,
  content: String,
  bibliography: String,
  createdAt: Date
});

const Article = mongoose.model("Article", articleSchema);

export default Article;