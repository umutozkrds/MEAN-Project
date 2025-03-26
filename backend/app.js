const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const Post = require('./models/post');
const { title } = require('process');

mongoose.connect("mongodb+srv://umuttozkardes:QQKN19ExH8tIXvvL@cluster0.1vwjv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connection is success")
  })
  .catch(() => {
    console.log("Connection is failed")
  })

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/posts', (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully!',
      postId: createdPost._id
    });
  });
});

app.get('/api/posts/:id', (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Post not found!' });
    }
  })
    .catch(error => {
      res.status(500).json({ message: 'Fetching post failed!' });
    });
});

app.get('/api/posts', (req, res, next) => {
  Post.find().then(data => {
    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: data
    });
  });
});

app.put('/api/posts/:id', (req, res, next) => {
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content
  })
  Post.updateOne({ _id: req.params.id }, post).then(result => {
    console.log(result);
    res.status(200).json({
      message: "updated!"
    })
  })
});

app.delete('/api/posts/:id', (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({
      message: "Post deleted!"
    });
  })
    .catch(error => {
      res.status(500).json({
        message: "Deleting post failed!"
      });
    });
});

module.exports = app;

