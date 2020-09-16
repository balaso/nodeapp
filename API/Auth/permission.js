const userService = require("../Service/UserService");
const db = require("../Database/db");
const  Role = db.Role;

module.exports = isAllowed;

function isAllowed (...allowed){
    const isAllowed = allowed;
    let isSysRole = false;
    let isPermission = false;
    return async (req, res, next) => {
        const user = await getCurrentUser(req.user.sub).then(currentUser =>{
           
            for(var i = 0; i < currentUser.roles.length; i++) {
                
                let role = new Role(currentUser.roles[i]);
                if(role.isSysRole){
                    isSysRole = true;
                    isPermission = true;
                    break;
                }else{
                    for(var j = 0; j < isAllowed.length; j++) {
                       if(role.name === isAllowed[j]){
                          isPermission = true;
                       }
                    }
                }
            }
        });
            if(isPermission === false){
                  var e = new Error(""); // e.name is 'Error'
                  e.name = 'Forbidden';
                  e.message = "You don't have permission to access this";
                  throw e;
            }else{
                next();
            }
    }
}

async function getCurrentUser(userID) {
    const user = await userService.getById(userID);
    return user;
};