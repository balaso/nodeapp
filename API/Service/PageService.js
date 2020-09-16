const db = require("../Database/db");
const Page = db.Page;

const UserDTO = "id login firstName lastName email imageUrl activated langKey createdBy createdDate lastModifiedBy lastModifiedDate authorities";

module.exports = {
    getById,
    getAvailablePages,
    addPage,
    deletePage
};


async function getById(id) {
    return await Page.findById(id).select('-__v');
}

async function getAvailablePages(req, res) {
    return await Page.find().select('-__v');
}

async function addPage(req, res) {
    const pageParam = req.body;
    await Page.findOne( { name : pageParam.name }).then( pageInfo => {
        if(pageInfo){
            throw 'Page "' + pageParam.name + '" is already added, please choose different name';
        }
    });

    pageParam.createdBy = req.userInfo.email;

    const page = new Page(pageParam);

    return await page.save().then(savedPage => {
        return savedPage;
    });
}

async function deletePage(req, res , id) {
    const page = await Page.findById(id);

    if(!page){
        throw "Page not available for delete";
    }

    const result = await Page.aggregate([{
        $match:{
          "name" : "Test Page"
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
