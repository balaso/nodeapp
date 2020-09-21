const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

var regEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

const UserSchema = new Schema({
    username : {
        type: String,
        index: true,
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
        index: true,
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
        index: true,
        default: null
    }, 
    lastName: {
        type: String,
        index: true,
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
        index: true,
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
    passwordUpdatedDate: {
        type: Date,
        default: null
    },
    loginDate: {
        type: Date,
        default: null
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

UserSchema.methods.generateToken=function(cb){
    var user =this;
    var token = jwt.sign(user._id ,confiq.SECRET);
    
    user.token = token;

    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

UserSchema.methods.generateHashPassword = function(password){
   return bcrypt.hashSync(password, 10);
}
UserSchema.plugin(uniqueValidator);

User = module.exports = mongoose.model('User', UserSchema);

User.ensureIndexes(function(err){
    if(err){
        console.log(err);
    }
});