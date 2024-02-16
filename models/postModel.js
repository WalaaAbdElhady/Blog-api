const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true
    },

    description: {
      type: String,
      required: [true, 'post description is required'],
      trim: true
    },

    image: {
      type: String
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    nComments: {
      type: Number,
      default: 0
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

// Virtual populate
PostSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id'
});

PostSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name image'
  });
  next();
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
