const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  aiTags: {
    type: [String],
    default: []
  },
  explanation: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Snippet = mongoose.model('Snippet', snippetSchema);

module.exports = Snippet;
