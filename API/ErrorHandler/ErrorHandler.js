module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // custom application error
        return res.status(400).json({ success: false, message: err });
    }

    if (err.name === 'ValidationError') {
        // mongoose validation error
        return res.status(400).json({ success: false, message: err.message });
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ success: false, message: 'Invalid Token' });
    }
    if(err.name === "ActivationKey"){
       return res.status(500).json({
            success: false, 
            "title" : "No user was found for this activation key",
            "status" : 500
          })
    }

    if(err.name === "Forbidden"){
        return res.status(403).json({
            success: false,
             "title" : "Forbidden Request",
             "message": err.message ? err.message : "",
             "status" : 403
           })
    }

    // default to 500 server error
    return res.status(500).json({ message: err.message });
}