const mongoose = require('mongoose'),
      { Schema } = mongoose;

foodSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    trim: true
  },

  expirationDate: {
    type: Date,
    required: true,

  },

  storageLocation: {
    type: String,
    required: true,
    trim: true
  },

  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [0, 'Cannot have negative food']
  },



});

module.exports = mongoose.model('Food', foodSchema);
