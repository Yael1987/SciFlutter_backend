import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "An article must have a name"],
    minLength: [15, "The name of the article is too short, please provide other name"],
    maxLength: [30, "The name of the article is too long, please provide a name with a maximum length of 30 characters"],
    trim: true,
  }, 
  image: {
    type: String,
    default: "article-default.jpg",
  },
  author: {
    type: mongoose.Schema.ObjectId,
    required: [true, "An article have to be published by one author"]
  },
  resume: {
    type: String,
    required: [true, "Please provide a resume and a introduction for your article"],
    minLength: [200, "Your resume and introduction are too short please try again with at least 200 characters"],
  }, 
  discipline: String,
  content: {
    type: String,
    required: [true, "An article can be published without content"],
    minLength: [200, "Your article is too short please try again with at least 200 characters"]
  },
  bibliography: {
    type: String,
    required: [true, "An article must have a bibliography"]
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});



const Article = mongoose.model("Article", articleSchema);

export default Article;