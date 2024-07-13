const mongoose = require("mongoose");

const connectDb = async () => {
    try{
        console.log("App is trying to connect with MongoDB...")
        const connect =  await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Database connection is established.", connect.connection.host, connect.connection.name);
    } catch (err){
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDb;