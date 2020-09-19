const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const RequestLogSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    method: {
        type: String,
        default: ""
    },
    url :{
        type: String,
        required: [true, 'URL is required'],
        index: true
    },
    IP: {
        type: String,
        default: ""
    },
    userId: {
        type: String,
        default: "0",
        index: true
    },
    startTime: {
        type: Date
        
    },
    endTime: {
        type: Date
        
    },
    TotalTimeRequired: {
        type: Number,
        default: 0
    },
    response: {
        type: Object,
        default: {}
    }
});

RequestLog = module.exports = mongoose.model('RequestLog', RequestLogSchema);

RequestLog.ensureIndexes(function(err){
    if(err){
        console.log(err);
    }
});