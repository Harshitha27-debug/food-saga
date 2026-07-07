const mongoose = require('mongoose');

const ShoppingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [
    {
      name: {
        type: String,
        required: true
      },
      amount: {
        type: String,
        default: ''
      },
      completed: {
        type: Boolean,
        default: false
      },
      recipeId: {
        type: String,
        default: null
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);
