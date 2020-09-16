const db = require("../Database/db");
const Role = db.Role;

module.exports = {
    getAll,
    addRole
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
                            function (err, docs) { 
            if (err){ 
                console.log(err) 
            } 
            else{ 
                console.log("Updated Rolew : ", docs); 
            }
            return docs; 
        }); 
       
            }
        }
    });

    const role = new Role(roleParam);

    return await role.save().then(savedRole => {
     return savedRole;
    });
}