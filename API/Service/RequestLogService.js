const db = require("../Database/db");
const RequestLog = db.RequestLog;


module.exports = {
    addRequestLog
};

function addRequestLog(logParam) {
    const log = new RequestLog(logParam);
    log.save();
}
