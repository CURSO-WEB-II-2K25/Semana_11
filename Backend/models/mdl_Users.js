const mongoose = require('mongoose');

const schUsers = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: String, required: true}
});

const Users = mongoose.model("Users", schUsers);

module.exports = Users;