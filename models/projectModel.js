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
    required: true
  },
  description: {
    type: String,
    required: true
  },
  collaborators: {
    type: [String], 
    default: [],
    required: false
  },
  additionalLink:{
    type: String,
    required: false
  
  },
  additionalLinkName:{
    type: String,
    required: false
  
  },
  created : {
    type: Date,
    default: Date.now,
    required: true
  }
});

const projectModel = mongoose.model('Project', ProjectSchema);

module.exports = projectModel;