const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const RoleSchema = new Schema({
    name: {
        type: String,
        unique: true,
        index: true,
        required: [true, 'Name is required'],
        minlength: [4, "`{VALUE}` is shorter than the minimum allowed length (4)"],
        maxlength: 100,
        validate: {
            validator: async function(name) {
              const role = await this.constructor.findOne({ name });
              if(role) {
                if(this.id === role.id) {
                  return true;
                }
                return false;
              }
              return true;
            },
            message: props => `The specified Role Name ${props.value} is already taken. Choose another one.`
        }
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
        index: true,
        default: ""
    },
    lastModifiedBy: {
        type: String,
        index: true,
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

RoleSchema.plugin(uniqueValidator);

Role = module.exports = mongoose.model('Role', RoleSchema);

Role.ensureIndexes(function(err){
    if(err){
        console.log(err);
    }
});