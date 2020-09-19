const bcrypt = require('bcryptjs');
const db = require("../Database/db");
const User = db.User;
const logger = require("../logger");

var randtoken = require('rand-token');
const jwt = require('jsonwebtoken');
const config = require("../Config/config").defaultConfig;

const DateDiff = require("../DateDiff");

module.exports = {
    register,
    authenticate,
    activateUser,
    requestPasswordReset,
    finishPasswordReset,
    changePassword
};

async function register(userParam) {
    // validate 
    userParam.activated = false;
    // Generate a 20 character alpha-numeric token:
    userParam.activationKey = randtoken.generate(20);
    
    userParam.createdBy = userParam.email;
    userParam.lastModifiedBy = userParam.email;

    const user = new User(userParam);
    // hash password
    if (userParam.password) {
         user.password = user.generateHashPassword(userParam.password);
    }

    var message = "Hi "+ user.username + "<br/>"
        message = message + "Your activation link is "+  userParam.activationKey;

    // save user
    return await user.save().then(saveUser => {
        return saveUser;
    });
}

async function authenticate(req, res) {
    const { username, password } = req.body;
    const userDTO = "_id id username email firstName lastName imageUrl roles password activated activationKey";

   
    const user = await User.findOne({ $or: [ { "username": username }, { "email" : username } ]}).select(userDTO).populate({
        path: 'roles',
        model: 'Role',
        select: { '__v': 0},
        populate: {
            path: 'pages',
            model: 'Page'           
        }
    })
    if(user && user.activated == false){
        res.status(400).json({
            "type": "AccountNotActivated",
            "title":  "Account is not activated, Please check your email",
            "status": 400,
            "link": user.activationKey
        });
    }
    if (user && user.comparePassword(password, user.password)) {
        
        let isSysRole = checkUserHaveSysRole(user);

        const userObj =  user.toObject();
        delete userObj.password;

        const { hash, ...userWithoutHash } = userObj;

        const id_token = jwt.sign({ sub : user.id}, config.jwt.secret, { expiresIn: '7d' });
        user.loginDate = Date.now();
        user.save();
        
        return {
            ...userWithoutHash,
            id_token,
            isSysRole
        };
        
    }
}

async function activateUser(req, res) {
    if(req.query.key){
        const user = await User.findOne({ activationKey: req.query.key})
        if(user){
            user.activated = true;
            user.activationKey = null;
            user.lastModifiedBy = user.email;
            user.lastModifiedDate = Date.now();
            await user.save().then(status =>{
               // console.log(" status " + status);
            });
        return { "success": true, message : "User Activated Successfully"}

        }else{
            var e = new Error('Malformed'); // e.name is 'Error'
            e.name = 'ActivationKey';
            throw e;
        }
    }
}

function checkUserHaveSysRole(currentUser){
    let isSysRole = false;
    for(var i = 0; i < currentUser.roles.length; i++) {
                
        let role = new Role(currentUser.roles[i]);
        if(role.isSysRole){
            isSysRole = true;
            break;
        }
    }
    return isSysRole;
}

async function requestPasswordReset(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ "email": email});
    if(user){
        // TODO : send mail
        user.resetKey = randtoken.generate(20);
        user.resetDate = Date.now();
        await user.save();
        return {"message":"Reset mail Send", "key" : user.resetKey };
    }else{
        var e = new Error("");
        e.name = "EmailNotFound";
        throw e;
    }
}


async function finishPasswordReset(req, res) {
    var KeyAndPasswordVM = req.body;
    const user = await User.findOne({resetKey: KeyAndPasswordVM.key} ).select('-hash');
    
    if(user){
        if(user.comparePassword( KeyAndPasswordVM.newPassword, user.password)){
            throw "Old Password and new Password are same.";
        }
        var diff = new DateDiff(Date.now(), user.resetDate);
        if(diff.hours() < 2){
           user.password = user.generateHashPassword(KeyAndPasswordVM.newPassword);
           user.resetKey = "";
           user.resetDate = null;
           user.lastModifiedBy = user.email;
           user.lastModifiedDate = Date.now();
           user.passwordUpdatedDate = Date.now();
           await user.save();
        }else{
            user.resetKey = randtoken.generate(20);
            user.resetDate = Date.now();
            await user.save();
            return {"status": false, "message":"Reset mail Send"};
        }
    }else{
        throw "Reset key not match with our DB.";
    }   
}

async function changePassword(req, res) {
    var passwordVM = req.body;
    const user = await User.findById(req.userInfo._id);
    if(user.comparePassword( passwordVM.currentPassword, user.password)){
        if(user.comparePassword( passwordVM.newPassword, user.password)){
            throw "Old Password and new Password are same.";
        }
        user.password = bcrypt.hashSync(passwordVM.newPassword, 10);
        user.lastModifiedBy = req.userInfo.email;
        user.lastModifiedDate = Date.now();
        user.passwordUpdatedDate = Date.now();
        return await user.save();
    }else{
         res.status(400).json({ success: false, message: "Old Password not match" });
    }
}
