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



async function addRole(req, res) {

    let roleParam = req.body;
    let pages = roleParam.pages ? roleParam.pages : []

    roleParam.createdBy = req.userInfo.email;
    roleParam.lastModifiedBy = req.userInfo.email;

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