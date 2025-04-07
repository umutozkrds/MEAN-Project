const express = require("express")
const bodyParser = require('body-parser');
const path = require('path')
const Post = require('../models/post');
const multer = require('multer');
const checkAuth = require("../middleware/check-auth")

const router = express.Router()

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype]
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, path.join("backend/images"));
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype]
    cb(null, name + '-' + Date.now() + '.' + ext)
  }
})

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use("images", express.static(path.join("backend/images")))


router.post('', checkAuth, multer({ storage: storage }).single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully!',
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath,
        creator: createdPost.creator
      }
    });
  }).catch(error => {
    res.status(500).json({
      message: "Creating a post failed!"
    })
  });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json({
        _id: post._id,
        title: post.title,
        content: post.content,
        imagePath: post.imagePath,
        creator: post.creator
      });
    } else {
      res.status(404).json({ message: 'Post not found!' });
    }
  })
    .catch(error => {
      res.status(500).json({ message: 'Fetching post failed!' });
    });
});

router.get('', (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPost;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
  }
  postQuery.then(documents => {
    fetchedPost = documents;
    return Post.countDocuments();
  })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: fetchedPost.map(post => {
          return {
            _id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            creator: post.creator
          };
        }),
        sumPost: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      })
    })
});

router.put('/:id', checkAuth, multer({ storage: storage }).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = {
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  };
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
    if (result.modifiedCount > 0) {
      res.status(200).json({
        message: "updated!"
      });
    }
    else {
      res.status(401).json({
        message: "Not authorized!"
      });
    }
  }).catch(error => {
    res.status(500).json({
      message: "Updating a post failed!"
    })
  });
});

router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
    if (result.deletedCount > 0) {
      console.log("Deleted")
      res.status(200).json({
        message: "Deleted!",
      });
    }
    else {
      console.log("Failed")
      res.status(401).json({
        message: "Failed!",
      });
    }
  }).catch(error => {
    res.status(500).json({
      message: "Deleting a post failed!"
    })
  });
});

module.exports = router;