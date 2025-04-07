const Post = require('../models/post');



exports.createPost = (req, res, next) => {
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
}

exports.findUserById = (req, res, next) => {
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
}

exports.getPosts = (req, res, next) => {
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
}

exports.updatePosts = (req, res, next) => {
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
    if (result.matchedCount > 0) {
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
}

exports.deletePosts = (req, res, next) => {
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
}
