const Post = require('./../models/postModel');
const Comment = require('./../models/commentModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.setUserId = (req, res, next) => {
  if (!req.body.author) req.body.author = req.user.id;
  next();
};

exports.getAllPosts = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.userId) filter = { author: req.params.userId };
  const posts = await Post.find(filter);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts
    }
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('comments');
  //console.log(post.comments);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      post: newPost
    }
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  // Check if The Post Belong To User
  if (post.author.id.toString() !== req.user.id.toString()) {
    //console.log(post.author.id.toString(), req.user.id.toString());
    return next(new AppError('You are not allowed to update this post', 403));
  }
  const doc = await Post.findByIdAndUpdate(req.params.id, req.body, {
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

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  // Check if The Post Belong To User
  if (post.author.id.toString() !== req.user.id.toString()) {
    //console.log(post.author.id.toString(), req.user.id.toString());
    return next(new AppError('You are not allowed to update this post', 403));
  }

  await Post.findByIdAndDelete(req.params.id);
  // Delete all comments on this post
  await Comment.deleteMany({ post: post.id });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
