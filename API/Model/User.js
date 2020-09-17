const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

var regEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

const UserSchema = new Schema({
    username : {
        type: String,
        unique: true,
        required: [true, 'Username is required'],
        minlength: [4, "`{VALUE}` is shorter than the minimum allowed length (4)"],
        maxlength: 100,
        validate: {
            validator: async function(username) {
              const user = await this.constructor.findOne({ username });
              if(user) {
                if(this.id === user.id) {
                  return true;
                }
                return false;
              }
              return true;
            },
            message: props => `The specified User Name ${props.value} is already taken. Choose another one.`
        }
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, 'E-Mail is required'],
        match: [regEmail, 'Please fill a valid email address'],
        validate: {
            validator: async function(email) {
              const user = await this.constructor.findOne({ email });
              if(user) {
                if(this.id === user.id) {
                  return true;
                }
                return false;
              }
              return true;
            },
            message: props => `The specified email address ${props.value} is already taken. Choose another one.`
          }
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    activated: {
        type: Boolean,
        required: true,
        default: false
    },
    firstName: {
        type: String,
        default: null
    }, 
    lastName: {
        type: String,
        default: null
    },
    langKey: {
        type: String
    },
    imageUrl: {
        type: String,
        default: ""
    },
    activationKey: {
        type: String,
        default: ""
    },
    resetKey: {
        type: String,
        default: ""
    },
    resetDate: {
        type: Date,
        default: Date.now
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
    roles: [
        { 
            type: Schema.Types.ObjectId,
            ref: 'Role'
        }
    ]
});

UserSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
}

UserSchema.methods.comparePassword = function(password, comparePassword) { 
    return bcrypt.compareSync(password, comparePassword)
};

UserSchema.methods.generateHashPassword = function(password){
   return bcrypt.hashSync(password, 10);
}
UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', UserSchema);