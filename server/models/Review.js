const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  recipeId: {
    type: String, // String to support both MongoDB ObjectId and external API recipe IDs (e.g. Spoonacular/TheMealDB)
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
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: [true, 'Please add review text']
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);
