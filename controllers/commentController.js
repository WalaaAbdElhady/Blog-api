const Comment = require('./../models/commentModel');
const Post = require('./../models/postModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.setPostUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.post) req.body.post = req.params.postId;
  if (!req.body.user) req.body.user = req.user.id;
  // console.log(req.body.post, req.body.user);

  next();
};

exports.getAllComments = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.postId) filter = { post: req.params.postId };
  const comments = await Comment.find(filter);
  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: {
      comments
    }
  });
});

exports.getComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      comment
    }
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const newComment = await Comment.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      comment: newComment
    }
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  // Check if The Comment Belong To User
  if (comment.user.id.toString() !== req.user.id.toString()) {
    return next(
      new AppError('You are not allowed to update this comment', 403)
    );
  }

  const doc = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      doc
    }
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  //console.log(comment.post.toString());
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  const post = await Post.findById(comment.post.toString());
  //console.log(post.author.id);
  // Check if The Comment Belong To User or Belong to author of the post
  if (
    comment.user.id.toString() !== req.user.id.toString() &&
    req.user.id.toString() !== post.author.id
  ) {
    return next(
      new AppError('You are not allowed to delete this comment', 403)
    );
  }

  await Comment.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
