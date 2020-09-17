const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    username : {
        type: String,
        unique: true,
        required: [true, 'Login is required']
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, 'E-Mail is required']
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

module.exports = mongoose.model('User', UserSchema);