const bcrypt = require('bcryptjs');
const db = require("../Database/db");
const User = db.User;

var randtoken = require('rand-token');
const jwt = require('jsonwebtoken');
const config = require("../Config/config").defaultConfig;


module.exports = {
    register,
    authenticate,
    activateUser
};

async function register(userParam) {
    // validate 
    await User.findOne( { $or: [ { username: userParam.username }, { email : userParam.email } ]}).then( userInfo => {
        if(userInfo !== null){
            if(userInfo.username === userParam.username){
                throw 'Username "' + userParam.username + '" is already taken';
            }else if(userInfo.email === userParam.email){
                throw 'Email "' + userParam.email + '" is already taken';
            }
        }
    });

    userParam.activated = false;
    // Generate a 20 character alpha-numeric token:
    userParam.activationKey = randtoken.generate(20);
    
    userParam.createdBy = userParam.email;

    const user = new User(userParam);
    // hash password
    if (userParam.password) {
        user.password = bcrypt.hashSync(userParam.password, 10);
    }

    var message = "Hi "+ user.username + "<br/>"
        message = message + "Your activation link is "+  userParam.activationKey;

    // save user
    return await user.save().then(saveUser => {
        
        let role = {
            "_id" : "5f60c6f00818b7169d0ae408"
        };
        console.log(user.roles);

    let updatedUser = db.User.findByIdAndUpdate(saveUser._id, { $push: { roles : role._id} },
        { upsert: true, new: true, useFindAndModify: false }, 
                            function (err, docs) { 
            if (err){ 
                console.log(err) 
            } 
            else{ 
                console.log("Updated User : ", docs); 
            }
            return docs; 
        }); 
        return updatedUser;
      });
}

async function authenticate(req, res) {
    const { username, password } = req.body;
    const userDTO = "_id id firstName lastName imageUrl roles password activated activationKey";

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
    if (user && bcrypt.compareSync(password, user.password)) {
        
        let isSysRole = checkUserHaveSysRole(user);

        const { hash, ...userWithoutHash } = user.toObject();

        const id_token = jwt.sign({ sub : user.id}, config.jwt.secret, { expiresIn: '7d' });
        
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
