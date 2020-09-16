const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    description:{
        type: String,
        default: ""
    },
    url :{
        type: String,
        required: [true, 'URL is required']
    },
    createdBy: {
        type: String,
        default: ""
    },
    lastModifiedBy: {
        type: String,
        default: ""
    },
    lastModifiedDate: {
        type: Date,
        default: Date.now
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
});

Page = module.exports = mongoose.model('Page', schema);
