const db = require("../Database/db");
const User = db.User;
const jwt = require('jsonwebtoken');

const UserDTO = "id login firstName lastName email imageUrl activated langKey createdBy createdDate lastModifiedBy lastModifiedDate authorities";

module.exports = {
    getById,
    getAll,
    getByEmail,
    getByUserName,
    delete: _delete,
    deleteByUserName,
    update
};

async function getById(id) {
    return await User.findById(id).select('-hash').populate("roles", "-_id -__v");
}

async function getByEmail(emailID) {
    return await (await User.findOne({email: emailID} )).select(UserDTO).populate("roles", "-_id -__v");
}

async function getByUserName(userId) {
    console.log(userId);
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

async function _delete(id) {
    await User.findByIdAndRemove(id);
}

async function deleteByUserName(req, res) {
    
    return await User.deleteOne({ username : req.params.username}).then(status =>{
      const { deletedCount } = status;
      if(deletedCount > 0){
        res.setHeader('Content-Type', 'application/json');
        res.json({ "success": true, message : "User Deleted Successfully"});
        res.send();
      }else{
          throw new Error("User not Available");
      }
    });
}

async function update(req, res) {
    
    const id = req.body._id;
    const userParam = req.body;
    const user = await User.findById(id);

    console.log(req.userInfo);

     if(req.user.username !== user.username){
        var e = new Error(""); // e.name is 'Error'
        e.name = 'Forbidden';
        e.message = "You can't update another User Info";
        throw e;
    }

    if(id === undefined ){
        throw 'User not found';
    }

    // validate
    if (!user) { throw 'User not found';}

   

    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.password = bcrypt.hashSync(userParam.password, 10);
    }
    userParam.lastModifiedDate = Date.now();

    // copy userParam properties to user
    Object.assign(user, userParam);
    await user.save(function(err, updatedUser) {
        if (err) {
            return res.send();
        }
       return updatedUser;
    });
}