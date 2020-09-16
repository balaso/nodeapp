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