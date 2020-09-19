module.exports.paginationParam = function(requestParam){
    var paginate = {
        pageNumber: 0,
        pageSize: 0,
        sortColumn: "",
        sortOrder: 0,
        skip: 0,
        sortCondition : {}
    }
    if(requestParam.size != undefined){
        paginate.pageSize = parseInt(requestParam.size, 10);
    }
    if(requestParam.page != undefined){
        paginate.pageNumber = parseInt(requestParam.page, 10);
        paginate.skip = paginate.pageSize * (paginate.pageNumber);
    }

    if(requestParam.sort != undefined){
        addSortCondition(requestParam, paginate.sortCondition);
    }  
    return paginate;
}
function addSortCondition(requestParam, sortObject){
    if(Array.isArray(requestParam.sort)){
        for (index = 0; index < requestParam.sort.length; index++) { 
            splitSortCondition(requestParam.sort[index], sortObject);
        } 
    }else{
        splitSortCondition(requestParam.sort, sortObject);
    }
}

function splitSortCondition(condition, sortObject){
    var sortConditions = condition.split(",");
    if(sortConditions.length == 2){
        var sortColumn = sortConditions[0] == "id" ? "_id" : sortConditions[0];
        var sortOrder = sortConditions[1] == "asc" ? 1 : -1;
        sortObject[sortColumn] = sortOrder;
    }
}