const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Express comes with a built in body parser that has built in support for JSON
const bodyParser = require("body-parser");
// Initialize the body parser to the Express app
app.use(bodyParser.json());

// Add mongoDB support to the project with Mongoose
// This is the way to connect to a MongoDB database in 2020:
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = mongoose.connection;

// This notifies the user if the connection to the DB was not successful.
let db_status = "MongoDB connection not successful.";

// create the Mongoose Schema
const postSchema = new mongoose.Schema({
  title: String,
  body: String,
});
//After declaring a schema, pass schema to a Mongoose model
const Post = mongoose.model("Post", postSchema);

// Set up a new POST route to save new posts
app.post("/posts", (req, res) => {
  const newPost = new Post(req.body);
  newPost.save((err, post) => {
    return err ? res.sendStatus(500).json(err) : res.json(post);
  });
});

// Set up a READ operation that reads all records and displays them
// Using the Post constant created to query with the pattern {} which means all posts, with no constraints
app.get("/posts", (req, res) => {
  Post.find({}, (error, data) => {
    if (error) return res.sendStatus(500).json(error);
    return res.json(data);
  });
});

// To READ just a single post, do the following:
// Pass the id of the post into the request query string.
app.get("/posts/:postId", (req, res) => {
  Post.findById(req.params.postId, (error, data) => {
    if (error) return res.sendStatus(500).json(error);
    return res.json(data);
  });
});

// To set up an update operation, create a new PUT route
// that finds the record in the database and
// updates the specified fields.
app.put("/posts/:postId", (req, res) => {
  Post.findByIdAndUpdate(
    req.params.postId,
    { $set: { title: req.body.title, body: req.body.body } },
    (error, data) => {
      if (error) return res.sendStatus(500).json(error);
      return res.json(req.body);
    }
  );
});

// To set up a DELETE operation, create a new DELETE route
// that finds the record by ID in the database
// and deletes it
app.delete("/posts/:postId", (req, res) => {
  Post.findByIdAndRemove(req.params.postId, {}, (error, data) => {
    if (error) return res.sendStatus(500).json(error);
    return res.json(data);
  });
});

// Listen for "error" events about connection issues.
db.on("error", console.error.bind(console, "connection error:"));
// Tell user if connection was successful and update status
db.once("open", () => (db_status = "Successfully opened connection to Mongo!"));

// we need a port to listen this was declared in the port constant
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// to test this, start your server by running ...about
// node server.js
