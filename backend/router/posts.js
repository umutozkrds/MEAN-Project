const express = require("express")
const bodyParser = require('body-parser');
const Post = require('../models/post');

const router = express.Router()

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post('', (req, res, next) => {
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

router.get('/:id', (req, res, next) => {
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

router.get('', (req, res, next) => {
  Post.find().then(data => {
    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: data
    });
  });
});

router.put('/:id', (req, res, next) => {
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

router.delete('/:id', (req, res, next) => {
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

module.exports = router;