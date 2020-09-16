const db = require("../Database/db");
const Role = db.Role;
const User = db.User;

module.exports = {
    getAll,
    addRole,
    getUserRole,
    deleteRole
};

async function getAll() {
    return await Role.find().select("-__v").populate("pages", "_id name url");
}



async function addRole(roleParam) {
    let pages = roleParam.pages ? roleParam.pages : []
    await Role.findOne( { name : roleParam.name }).then( roleInfo => {
        if(roleInfo !== null){
            if(roleInfo.name === roleParam.name){
                throw 'Role "' + roleParam.name + '" is already defined';
            }else{
        Role.findByIdAndUpdate(roleInfo._id, { $push: { pages : "5f60e68e3827fdbd757b7e05"} },
                { upsert: true, new: true, useFindAndModify: false }, 
                                    function (err, roles) { 
                    if (err){ 
                        console.log(err) 
                    } 
                    else{ 
                        console.log("Updated Role : ", roles); 
                    }
                    return roles; 
                }); 
            }
        }
    });

    const role = new Role(roleParam);

    return await role.save().then(savedRole => {
        return savedRole;
    });
}

async function getUserRole(req, res){
    let uname = req.userInfo.username;
   const result = await User.aggregate([{
    $match:{
      username: uname 
    }
   },
   { $lookup:
      {
        from: 'roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'roles'
      }
    },    
   {
    $project:{
       username:"$username",
       "roles._id" : 1,        
        "roles.isSysRole" :1 ,
        "roles.name" :1,
        "roles.pages" : 1
        
    }
 }
   ], function (err, result) {
            if (err) {
                return err;
            }
            
            return { success : true, data: result};
        });

        console.log(result);
        
    return result;
}

async function deleteRole(req, res , id) {
    const role = await Role.findById(id);

    if(!role){
        throw "Role not available for delete";
    }
    if(role.isSysRole){
        var e = new Error
        e.name = 'Forbidden';
        e.message = "You can't delete system role";
        throw e;
    }

    const result = await Role.aggregate([{
        $match:{
          "name" : role.name
        }
       },
       { $lookup:
          {
            from: 'users',
            localField: '_id',
            foreignField: 'roles',
            as: 'users'
          }
        },    
       {
        $project:{
           "name" : 1,
           "isSysRole" :1,
           "users.username" : 1,        
            "users.email" :1 
            
        }
    }
       ]);

       if(result[0].users.length == 0){
           await Role.findByIdAndRemove(id);
       }else{
        var e = new Error
        e.name = 'DependencyError';
        e.message = "Dependent User available please remove role from these users.";
        e.developerMessage = " roles : " + JSON.stringify(result[0].users);
        throw e;
       }
}