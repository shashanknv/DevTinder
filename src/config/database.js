const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://shashanknv:nvsr1234@namastenode.qliva.mongodb.net/devTinder"
    );
};

module.exports = connectDB;