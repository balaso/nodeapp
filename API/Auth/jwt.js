const expressJwt = require('express-jwt');

const config = require("../Config/config").defaultConfig;

const userService = require("../Service/UserService");

module.exports = jwt;

function jwt() {
    const secretKey = config.jwt.secret;
    return expressJwt({ secret: secretKey, algorithms: ['HS256'], isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            "/api/authenticate",
            "/api/register",
            "/api/activate",
            "/api/roles"
        ]
    });
}

async function isRevoked(req, payload, done) {
    let currentUser = await userService.getById(payload.sub);
    
    // revoke token if user no longer exists
    if (!currentUser) {
        return done(null, true);
    }else{
        let isSysRole = checkUserHaveSysRole(currentUser);
        currentUser["isSysRole"] = isSysRole;
        req.userInfo = currentUser;
        req.isSysRole = isSysRole
    }
    done();
};

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
