const express = require('express');
const { signup, signin, signout } = require('../controllers/ctrl_Users.js');
const { verifyToken ,verifyRol, verifyDuplicates, isRoot,isAdmin,isUser } = require('../middleware/func_Users.js');

const users = express.Router();

users.post('/signup', [verifyToken, isRoot, verifyDuplicates, verifyRol], signup);
users.post('/signin', signin);
users.post('/signout', signout);

module.exports = users;