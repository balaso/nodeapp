const db = require("../Database/db");
const User = db.User;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserDTO = "id login firstName lastName email imageUrl activated langKey createdBy createdDate lastModifiedBy lastModifiedDate authorities";

module.exports = {
    getById,
    getAll,
    getByEmail,
    getByUserName,
    delete: _delete,
    deleteByUserName,
    update,
    create
};

async function getById(id) {
    return await User.findById(id).select('-hash').populate("roles", "-_id -__v");
}

async function getByEmail(emailID) {
    return await (await User.findOne({email: emailID} )).select(UserDTO).populate("roles", "-_id -__v");
}

async function getByUserName(userId) {
    return await User.findOne({username: userId} ).select(UserDTO).populate("roles", "-_id -__v");
}

async function getAll(req, res) {
   // var paginateParam = paginate.paginationParam(req.query);
    const count = await User.countDocuments();
    res.setHeader("X-Total-Count",count);
    var users = [];
    /*
    if(paginateParam.pageNumber == 0){
        users = await User.find().select(UserDTO).limit(paginateParam.pageSize).sort(paginateParam.sortCondition).populate("authorities", "-_id -__v");
    }else{
        users = await User.find().select(UserDTO).skip(paginateParam.pageSize * (paginateParam.pageNumber - 1)).limit(paginateParam.pageSize).sort(paginateParam.sortCondition).populate("authorities", "-_id -__v");
    }*/
    users = await User.find().populate("roles", "-_id -__v");
    return users;
}

async function _delete(req, res, id) {
    const user = await User.findById(id);

     if(req.userInfo.username !== user.username || !req.isSysRole){
        var e = new Error
        e.name = 'Forbidden';
        e.message = "You can't delete another User Info";
        throw e;
    }
    await User.findByIdAndRemove(id);
}

async function deleteByUserName(req, res) {
    
    const user = await User.find({ username : req.params.username});

     if(req.userInfo.username !== req.params.username && !req.isSysRole){
        var e = new Error
        e.name = 'Forbidden';
        e.message = "You can't delete another User Info";
        throw e;
    }

    return await User.deleteOne({ username : req.params.username}).then(status =>{
      const { deletedCount } = status;
      if(deletedCount > 0){
      }else{
          throw new Error("User not Available");
      }
    });
}

async function update(req, res, next) {
    
    const id = req.body._id;
    if(id === undefined ){
        throw 'User not found. ID not available.';
    }

    const userParam = req.body;
    const user = await User.findById(id);

     if(req.userInfo.username !== user.username && !req.isSysRole){
        var e = new Error
        e.name = 'Forbidden';
        e.message = "You can't update another User Info";
        throw e;
    }

    
    // validate
    if (!user) { throw 'User not found';}
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    if (user.email !== userParam.email && await User.findOne({ email: userParam.email })) {
        throw 'Email "' + userParam.email + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.password = bcrypt.hashSync(userParam.password, 10);
    }
    userParam.lastModifiedDate = Date.now();
    userParam.lastModifiedBy = req.userInfo.email

    // copy userParam properties to user
    Object.assign(user, userParam);
    return await user.save().then(updatedUser => {
        return updatedUser;
    });
}

async function create(req, res) {
    
    const userParam = req.body;
    
    if(userParam.langKey == null){
        userParam.langKey = defaultProperties.DEFAULT_LANGUAGE;
    }

    // Generate a 20 character alpha-numeric token:
    userParam.activated = true;
    userParam.resetKey = null;
    
    userParam.createdBy = req.userInfo.email;

   const user = new User(userParam);
    if (userParam.password) {
        user.password = user.generateHashPassword(userParam.password);
   }

    // save user
   const createdUser = await user.save().then(savedUser => {
        return savedUser;
    });
    /*await user.save((err, savedUser) => { 
        if (err) { 
            throw "Failed to add user." 
        } 
        else { 
           return savedUser
        } 
    });*/
    return createdUser;
}