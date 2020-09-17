const config = require("../Config/config").defaultConfig;
const mongoose = require('mongoose');

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  };

mongoose.connect(config.connectionString, options).then(
    () => { console.log("Connection set");  },
    err => { console.log("error occured") }
);

mongoose.Promise = global.Promise;

db = module.exports = {
    User: require("../Model/User"),
    Role: require("../Model/Role"),
    Page: require("../Model/Page")
};

initialize();

async function initialize() {
    console.log(" <---- Initialize Database ---> ");
    
    /*** Get Admin Config from config file ***/
    const adminUserConfig = config.adminUser;

    const roleParam = {
        "name": "Admin",
        "isSysRole": true,
        "createdBy" : adminUserConfig.email
    }
    let adminRole = "";
    /*** check  admin role is in db if not then insert ***/
    adminRole = await db.Role.findOne( { name : roleParam.name }).then( roleInfo => {
        return roleInfo;
    });
    if(adminRole === null){
        const role = new db.Role(roleParam);
        adminRole = await role.save().then(savedRole => {
            return savedRole;
        });
    }

    
    
    /***  check admin User in system if not then insert ***/
    let adminUserParam = {
        "username": adminUserConfig.username,
        "email": adminUserConfig.email,
        "password": adminUserConfig.password,
        "createdBy" : adminUserConfig.email,
        "activated" : true,
        "firstName" : "Admin",
        "langKey": "en",
        "roles":[]
    }
    
    adminUserParam.roles.push(adminRole);
    
    let adminUser = await db.User.findOne( { $or: [ { username: adminUserParam.username }, { email : adminUserParam.email } ]}).then( userInfo => {
        return userInfo;
    });
    
    if(adminUser === null){
        let admin = new db.User(adminUserParam);
        admin.password = admin.generateHashPassword(admin.password);
        adminUser = await admin.save().then(savedUser => {
            return savedUser;
        });
    }

    console.log(" Admin user   --->  "+ JSON.stringify(adminUser.toJSON()));
    console.log(" <---- Initialize Completed  ----> ")
}