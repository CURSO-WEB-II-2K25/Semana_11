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
const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const createError = require('http-errors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

// crear la aplicacion 
const app = express();

// Configuración CORS para tu frontend (ajusta el origen si es necesario)
const corsOptions = {
  origin: 'http://localhost:5000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware para parsear JSON y urlencoded, Parsear JSON y urlencoded
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


// Habilitar Helmet para seguridad HTTP
app.use(helmet());

// Configurar cookie-session correctamente para CommonJS
const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
const cookieKey = require('./config/cookieSecret.js');
app.use(
  cookieSession({
    name: 'L&E-session',
    keys: [cookieKey], // OJO: Debes usar una clave secreta real y ponerla en variable de entorno
    httpOnly: true,
    expires: expiryDate,
  })
);

// Importar variables de conexión
const dbConfig = require('./config/configDB.js');
mongoose.connect(`mongodb://${dbConfig.USER}:${dbConfig.PASS}@${dbConfig.HOST}/`, { dbName: dbConfig.DB });

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    // Llamar inicialización y luego crear root user
    initial().then(() => {
    createDefaultRootUser();
    });
});

mongoose.connection.on('error', err => {
    console.error('MongoDB error de coneccion:', err);
});

mongoose.connection.on('Desconectado', () => {
    console.warn('MongoDB Desconectado');
});

// Cargar modelos 
require('./models/mdl_Categories.js');
require('./models/mdl_Users.js');
require('./models/mdl_Roles.js');

// Rutas
const indexRouter = require('./routes/rout_Index.js');
const categoriesRouter = require('./routes/rout_Categories.js');
const usersRouter = require('./routes/rout_Users.js');

app.use('/', indexRouter);
app.use('/imagenes', categoriesRouter);
app.use('/usuarios', usersRouter);

// Crear roles iniciales
async function initial() {
    const Roles = mongoose.model('Roles');
    try {
        const count = await Roles.estimatedDocumentCount();
        if (count === 0) {
            const newRoles = [
                { name: 'guest', level: 1, description: 'Guest-user' },
                { name: 'user', level: 3, description: 'Normal-user' },
                { name: 'admin', level: 5, description: 'Administrator' },
                { name: 'root', level: 3, description: 'Super-user' },
            ];
            await Roles.insertMany(newRoles);
            console.log("added 'guest', 'root', 'user' and 'admin' to roles collection");
        }
    } catch (err) {
        console.error('Error creating roles:', err);
    }
}

// Crear usuario root por defecto
async function createDefaultRootUser() {
    const Users = mongoose.model('Users');
    const Roles = mongoose.model('Roles');

    try {
        const existingUser = await Users.findOne({ username: 'root' });
        if (existingUser) {
            console.log("El usuario root ya existe.");
            return;
        }
        const rootRole = await Roles.findOne({ name: 'root' });
        if (!rootRole) {
            console.error("El rol 'root' no existe. Asegúrate de que los roles se hayan creado correctamente.");
            return;
        }

        const hashedPassword = await bcrypt.hash(dbConfig.PASS, 10);

        const newUser = new Users({
            username: 'root',
            email: 'root@example.com',
            password: hashedPassword,
            rol: rootRole.name,  // Aquí asignas el string 'root'
            fullname: 'Super Usuario Root'
        });

        await newUser.save();
        console.log(`Default root user created (username: root, password: ${hashedPassword})`);
    } catch (err) {
        console.error('Error de crear el usuario root:', err);
    }
}

// Ejecutar servidor
const server = app.listen(5000, () => {
    console.log(`Server escuchando en el puerto ${server.address().port}`);
});