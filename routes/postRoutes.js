const express = require('express');
const postController = require('./../controllers/postController');
const authController = require('./../controllers/authController');
const commentRouter = require('./commentRoutes');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use('/:postId/comments', commentRouter);

router
  .route('/')
  .get(postController.getAllPosts)
  .post(postController.setUserId, postController.createPost);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

module.exports = router;
