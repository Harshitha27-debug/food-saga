const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  recipeId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userPicture: {
    type: String,
    default: ''
  },
  commentText: {
    type: String,
    required: [true, 'Please add a comment']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);
