const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipeId: {
    type: String,
    required: true
  },
  recipeTitle: {
    type: String,
    required: true
  },
  recipeImage: {
    type: String,
    default: ''
  },
  cuisine: {
    type: String,
    default: 'Unknown'
  },
  category: {
    type: String,
    default: 'Main Course'
  }
}, {
  timestamps: true
});

// Ensure a user can only favorite a specific recipe once
FavoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
