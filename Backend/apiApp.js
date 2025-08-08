/*
========================================================================================
Centro....: Universidad Técnica Nacional
Sede......: Pacífico
Carrera...: Tecnologías de Información
Curso.....: ITI-523 - Tecnologías y Sistemas Web II
Periodo...: 2-2025
Documento.: Semana 11 - Práctica 03
Tema......: API REST con NodeJS, Express y MongoDB
Objetivos.: Crear una API REST que permita gestionar imágenes almacenadas en MongoDB.          
Profesor..: Jorge Ruiz (york)
Estudiante: Esteban Amores and Laura Montero
========================================================================================
*/

// call external libraries
const express = require('express');
const bodyParser = require('body-parser');
let cors = require('cors')
let mongoose = require('mongoose');
const fs = require('node:fs');


// create a middleware to upload files
const multer = require("multer");
const subir = multer({ dest: "subirfoto/" });

// create an instance of express
const app = express();
const port = 5000;

// Conexión a MongoDB con Mongoose
mongoose.connect('mongodb://admin:esteban2511@localhost:27017/apiImgDB?authSource=admin')
const Categories = require("./models/mdl_Article.js")
// Use CORS
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// create listener for GET requests to the root URL
app.get('/', (req, res) => {
    salida = {
        status_code: 200,
        status_message: 'OK',
        content: {
            mensaje: 'Hola Mundo - Practica03 - API REST con NodeJS, Express y MongoDB',
            autor: 'Jorge Ruiz (york)',
            student: "Esteban Amores and Laura Montero",
            fecha: new Date()
        }
    }
    res.status(200).json(salida);
});

// function to convert image to Base64
function getBase64Image(filePath) {
    const image = fs.readFileSync(filePath);
    return Buffer.from(image).toString('base64');
}

app.get('/imagenes/:id', async function obtenerCategoria(req, res) {
    const id = req.params.id;
    try {
        const categoria = await Categories.findOne({ CategoryID: id });
        if (!categoria) {
            return res.status(404).json({
                status_code: 404,
                status_message: "Not Found",
                content: { error: "Categoría no encontrada" }
            });
        }

        res.status(200).json({
            status_code: 200,
            status_message: "OK",
            content: {
                resultado: {
                    CategoryID: categoria.CategoryID,
                    CategoryName: categoria.CategoryName,
                    Description: categoria.Description,
                    Mime: categoria.Mime,
                    Image: categoria.Image.toString("base64") // Convertir la imagen a Base64
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            status_message: "Internal Server Error",
            content: { error: error.toString() }
        });
    }
});

app.get('/foto/:id', async function obtenerImagenMongo(req, res) {
    const id = req.params.id;

    try {
        const categoria = await Categories.findOne({ CategoryID: id });

        if (!categoria || !categoria.Image) {
            return res.status(404).json({
                status_code: 404,
                status_message: "Not Found",
                content: { error: "Imagen no encontrada" }
            });
        }
        res.writeHead(200, {
            "Content-Type": categoria.Mime,
            "Content-Length": categoria.Image.length
        });
        res.end(categoria.Image);

    } catch (error) {
        res.status(500).json({
            status_code: 500,
            status_message: "Internal Server Error",
            content: { error: error.toString() }
        });
    }
});

app.post("/imagenes", subir.array("imagen", 1), async function subirFoto(req, res) {
    try {
        // obtener los valores del body
        const { id, nombre, descripcion } = req.body;
        const imagenBuffer = fs.readFileSync(req.files[0].path);
        const mime = req.files[0].mimetype;

        // crear el documento para MongoDB
        const nuevaCategoria = new Categories({
            CategoryID: id,
            CategoryName: nombre,
            Description: descripcion,
            Image: imagenBuffer,
            Mime: mime
        });

        await nuevaCategoria.save();

        // eliminar el archivo temporal
        fs.unlinkSync(req.files[0].path);

        res.status(200).json({
            status_code: 200,
            status_message: 'OK',
            content: {
                resultado: 'Categoría guardada correctamente'
            }
        });
    } catch (error) {

        // eliminar el archivo temporal si existe
        if (req.files && req.files[0] && fs.existsSync(req.files[0].path)) {
            fs.unlinkSync(req.files[0].path);
        }
        res.status(500).json({
            status_code: 500,
            status_message: 'Internal Server Error',
            content: { error: error.toString() }
        });
    }
});

/*
// ---------------------------------------------------
// Section - Creates the database connection
// ---------------------------------------------------
// Import the database connection variables
import dbConfig  from './config/configDB.js';

// Try to connect to the database
mongoose.set('strictQuery', true);
mongoose.connect(`mongodb://${dbConfig.USER}:${dbConfig.PASS}@${dbConfig.HOST}/`,{ dbName: dbConfig.DB })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        initial().then(r => console.log("Initial roles created"));
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

// Load models
import './models/mdl_Users.js';
import './models/mdl_Roles.js';

// Create the initial roles if they do not exist
async function initial() {
    const Roles = mongoose.model('Roles');

    await Roles.estimatedDocumentCount().then((count) => {
        if (count === 0) {
            const newRoles = [
                {
                    name: "guest",
                    level: 1,
                    description: "Guest user"
                },
                {
                    name: "user",
                    level: 3,
                    description: "Normal user"
                },
                {
                    name: "admin",
                    level: 5,
                    description: "Administrator"
                },
                {
                    name: "root",
                    level: 3,
                    description: "Super user"
                }];

            Roles.insertMany(newRoles).then(() => {
                console.log("added 'guest', 'root' 'user' and 'admin' to roles collection");
            }).catch(err => {
                console.log("error", err);
            });
        }
    });
}

// Crear usuario root por defecto si no existe
import bcrypt from 'bcryptjs';

async function createDefaultRootUser() {
    const Users = mongoose.model('Users');
    const Roles = mongoose.model('Roles');

    // Verificar si el usuario 'root' ya existe
    const existingUser = await Users.findOne({ username: 'root' });
    if (existingUser) {
        console.log("Root user already exists");
        return;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('provisional123', 10);

    // Crear el usuario
    const newUser = new Users({
        username: 'root',
        email: 'root@example.com',
        password: hashedPassword,
        roles: [rootRole._id]
    });

    await newUser.save();
    console.log("Default root user created (username: root, password: provisional123)");
}
*/

// run server
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
