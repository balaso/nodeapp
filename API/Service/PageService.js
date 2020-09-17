const db = require("../Database/db");
const Page = db.Page;
var ObjectId = require('mongodb').ObjectID;

const UserDTO = "id login firstName lastName email imageUrl activated langKey createdBy createdDate lastModifiedBy lastModifiedDate authorities";

module.exports = {
    getById,
    getAvailablePages,
    addPage,
    deletePage,
    update,
    getPageWiseRoles,
    getUserPageWise
};


async function getById(id) {
    return await Page.findById(id).select('-__v');
}

async function getAvailablePages(req, res) {
    return await Page.find().select('-__v');
}

async function addPage(req, res) {
    const pageParam = req.body;

    pageParam.createdBy = req.userInfo.email;

    const page = new Page(pageParam);

    return await page.save().then(savedPage => {
        return savedPage;
    });
}

async function deletePage(req, res , id) {
    const pageId = new ObjectId(id);

    const result = await Page.aggregate([{
        $match:{
            "_id" : pageId
        }
       },
       { $lookup:
          {
            from: 'roles',
            localField: '_id',
            foreignField: 'pages',
            as: 'roles'
          }
        },    
       {
            $project:{
            "name" : 1,
            "roles.name" :1
            }
        }
       ]);

        if(result === null || result.length === 0){
            throw "Page not available for delete";
        }

       if(result[0].roles.length == 0){
          await Page.findByIdAndRemove(id);
       }else{
        var e = new Error
        e.name = 'DependencyError';
        e.message = "Dependent Role available please remove page from these roles.";
        e.developerMessage = " roles : " + JSON.stringify(result[0].roles);
        throw e;
       }
}

async function update(req, res, next) {
    
    const id = req.body._id;
    if(id === undefined){
        throw "Page id not Available ";
    }

    const pageParam = req.body;
    const page = await Page.findById(id);

    if (!page) { throw 'Page not found';}

    if (page.name !== pageParam.name && await Page.findOne({ name: pageParam.name })) {
        throw 'Page "' + pageParam.name + '" is already taken';
    }

    if (page.url !== pageParam.url && await Page.findOne({ url: pageParam.url })) {
        throw 'Page URL "' + pageParam.email + '" is already taken';
    }

    pageParam.lastModifiedDate = Date.now();
    pageParam.lastModifiedBy = req.userInfo.email

    // copy pageParam properties to page
    Object.assign(page, pageParam);
    return await page.save().then(updatedPage => {
        return updatedPage;
    });
}

async function getPageWiseRoles(req, res, next) {
    
    const { pageName, roleName } = req.query;
    
    let match = {};
    if(pageName !== undefined){
        match["name"] = pageName
    }
    if(roleName !== undefined){
        match["roles.name"] = roleName
    }

    return Page.aggregate([
            { "$lookup":
                {
                    "from": 'roles',
                    "localField": '_id',
                    "foreignField": 'pages',
                    "as": 'roles'
                }
            },
            {
                "$match": match
            },    
            {
                "$project":{
                    "name" : 1,
                    "url" : 1,
                    "description" : 1,
                    "roles.name" :1,
                    "roles.description" :1
                }
            }
        ]);
}


async function getUserPageWise(req, res, next) {
    console.log("user");
    
    const { pageName } = req.query;
    let match = {};
    if(pageName !== undefined){
        match["name"] = pageName
    }

return Page.aggregate([
            { "$lookup":
                {
                    "from": 'roles',
                    "localField": '_id',
                    "foreignField": 'pages',
                    "as": 'roles'
                }
            },
            { 
                "$lookup":
                    {
                        "from":"users",
                        "localField":"roles._id",
                        "foreignField":"roles", 
                        "as":"users"
                    }
            },
            {
                "$match": match
            },    
            {
                "$project":
                {
                    "name" : 1,
                    "url" : 1,
                    "description" : 1,
                    "users.username" : 1,
                    "users.email" : 1
                }
            }
    ]);
}
