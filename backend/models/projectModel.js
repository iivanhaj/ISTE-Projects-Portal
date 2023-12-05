const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  tagline: {
    type: String,
    required: true
  },
  mainUrl: {
    type: String,
    required: true
  },
  nameOfLink: {
    type: String,
    required: true
  },
  images: {
    type: String,
    default: null,
    required: false
  },
  description: {
    type: String,
    required: true
  }
});

const projectModel = mongoose.model('Project', ProjectSchema);

module.exports = projectModel;