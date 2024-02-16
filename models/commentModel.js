const mongoose = require('mongoose');
const Post = require('./postModel');

const commentSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Comment description is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
  {
    timestamps: true
  }
);

commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name image'
  });
  next();
});

commentSchema.statics.calcNumOfComments = async function(postId) {
  const stats = await this.aggregate([
    {
      $match: { post: postId }
    },
    {
      $group: {
        _id: '$post',
        nComments: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Post.findByIdAndUpdate(postId, {
      nComments: stats[0].nComments
    });
  } else {
    await Post.findByIdAndUpdate(postId, {
      nComments: 0
    });
  }
};

commentSchema.post('save', function() {
  this.constructor.calcNumOfComments(this.post);
});

commentSchema.pre(/^findOneAnd/, async function(next) {
  this.c = await this.model.findOne(this.getQuery());
  next();
});

commentSchema.post(/^findOneAnd/, async function() {
  await this.c.constructor.calcNumOfComments(this.c.post);
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
