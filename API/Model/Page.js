const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const PageSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Name is required'],
        minlength: [4, "`{VALUE}` is shorter than the minimum allowed length (4)"],
        maxlength: 100,
        validate: {
            validator: async function(name) {
              const page = await this.constructor.findOne({ name });
              if(page) {
                if(this.id === page.id) {
                  return true;
                }
                return false;
              }
              return true;
            },
            message: props => `The specified Page Name ${props.value} is already taken. Choose another one.`
        }
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    url :{
        type: String,
        unique: true,
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

PageSchema.plugin(uniqueValidator, { type: 'mongoose-unique-validator' });

Page = module.exports = mongoose.model('Page', PageSchema);
