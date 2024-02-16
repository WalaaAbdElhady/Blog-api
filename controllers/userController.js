const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const Post = require('./../models/postModel');
const Comment = require('./../models/commentModel');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  return res.status(500).json({
    status: 'error',
    message: 'This rout is not yet defined ! Please use /signup instead'
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No User found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    return next(new AppError('No User found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No User found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    message: null
  });
});

exports.following = catchAsync(async (req, res, next) => {
  // Find the user who is following
  const userWhoIsFollowing = await User.findById(req.user.id);
  // Find the user to follow
  const userToFollow = await User.findById(req.params.id);
  //console.log(userToFollow, userWhoIsFollowing);
  if (req.params.id === req.user.id) {
    return next(new AppError('You can not follow yourself', 403));
  }
  // Check if user and userWhoFollowed are found
  if (userToFollow && userWhoIsFollowing) {
    // Check if userWhofollowed is already in the user's followers
    const isUserAlreadyFollowed = userWhoIsFollowing.following.find(
      follower => follower === userWhoIsFollowing.id
    );

    if (isUserAlreadyFollowed) {
      return next(new AppError('You already followed this user'));
    }
    // add userToFollow to the userWhoFollowed's following array
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: {
          following: userToFollow.id
        }
      },
      { new: true, runValidators: true }
    );
    // add userWhoFollowed into the user's followers array
    await User.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: {
          followers: userWhoIsFollowing.id
        }
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      status: 'success',
      message: 'You have successfully follow this user'
    });
  } else {
    return next(new AppError('User that you trying to follow not found!', 403));
  }
});

exports.Unfollowing = catchAsync(async (req, res, next) => {
  // Find the user who is unfollowing
  const userWhoIsUnfollowing = await User.findById(req.user.id);
  // Find the user to Unfollow
  const userToUnfollow = await User.findById(req.params.id);

  // Check if user and userWhoFollowed are found
  if (userWhoIsUnfollowing && userToUnfollow) {
    // Check if userWhoIsUnfollowing is already follow userToUnfollow
    const isUserAlreadyFollowed = userWhoIsUnfollowing.following.find(
      follower => follower === userToUnfollow.id
    );

    if (!isUserAlreadyFollowed) {
      return next(new AppError('You have not followed this user'));
    }
    //  remove userToFollow from the userWhoFollowed's following array
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          following: userToUnfollow.id
        }
      },
      { new: true, runValidators: true }
    );
    // remove userWhoFollowed from the user's followers array
    await User.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          followers: userWhoIsUnfollowing.id
        }
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      status: 'success',
      message: 'You have successfully unfollow this user'
    });
  } else {
    return next(
      new AppError('User that you trying to unfollow not found!', 403)
    );
  }
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  await Post.deleteMany({ author: req.user.id });
  await Comment.deleteMany({ user: req.user.id });

  await User.findByIdAndDelete(req.user.id);

  res.status(204).json({
    status: 'success',
    message: null
  });
});
