const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Name is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    isSysRole:{
        type: Boolean,
        default: false
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
    pages: [
        { 
            type: Schema.Types.ObjectId,
            ref: 'Page'
        }
    ]
});

Role = module.exports = mongoose.model('Role', schema);