const express = require("express")
const bodyParser = require('body-parser');
const path = require('path')

const checkAuth = require("../middleware/check-auth")
const postController = require("../controllers/post")
const extractFile = require("../middleware/file")

const router = express.Router()



router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use("images", express.static(path.join("backend/images")))


router.post('', checkAuth, extractFile, postController.createPost);

router.get('/:id', postController.findUserById);

router.get('', postController.getPosts);

router.put('/:id', checkAuth, extractFile, postController.updatePosts);

router.delete('/:id', checkAuth, postController.deletePosts);

module.exports = router;
