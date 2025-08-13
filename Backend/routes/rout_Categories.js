const express = require('express');
const { getCategories, getCategoriesFoto, addCategories } = require('../controllers/ctrl_Categories.js');
const { verifyToken,checkRoles,isAdmin, isUser, isRoot } = require('../middleware/func_Users.js');
const multer = require('multer');
const categories = express.Router();
const subir = multer({ dest: 'subirfoto/' });

// Usuarios general
//categories.get("/imagenes/:id", getCategories);
//categories.get("/foto/:id", getCategoriesFoto);

// Usuarios general
categories.get('/imagenes/:id', getCategories);
categories.get('/foto/:id', getCategoriesFoto);

// Root and User (acceso para roles 'user' o 'root')
//categories.post("/imagenes", [verifyToken, isUser, isRoot, subir.array('imagen', 1)], addCategories);
categories.post('/imagenes',[verifyToken, checkRoles(['user', 'root']), subir.array('imagen', 1)],addCategories);


module.exports = categories;