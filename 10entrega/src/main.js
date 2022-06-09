const path = require('path');
const express = require('express');
const faker = require('faker');
const normalizr = require('normalizr');
const normalize = normalizr.normalize;
const schema = normalizr.schema;
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const MongoStore = require('connect-mongo');
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const { Server: HttpServer } = require('http');
const { Server: Socket } = require('socket.io');

const ContenedorSQL = require('./contenedores/ContenedorSQL.js');
const ContenedorFirebase = require('./contenedores/ContenedorFirebase');
const config = require('./config.js');
faker.locale = 'es';
//--------------------------------------------
// instancio servidor, socket y api

const app = express();
app.engine(
  'hbs',
  handlebars({
    extname: '.hbs',
    layoutsDir: process.cwd() + '/views/pages',
    defaultLayout: false,
  })
);
app.set('views', path.join(process.cwd(), 'views', 'pages'));
app.set('view engine', 'hbs');

const httpServer = new HttpServer(app);
const io = new Socket(httpServer);

const productosApi = new ContenedorSQL(config.mariaDb, 'productos');
const mensajesApi = new ContenedorFirebase('mensajes');

//--------------------------------------------
// NORMALIZACIÓN DE MENSAJES
const idSchema = new schema.Entity('ids');
const textSchema = new schema.Entity('texts');
const dateSchema = new schema.Entity('dates');
// Definimos un esquema de autor
const authorSchema = new schema.Entity('authors', {}, { idAttribute: 'mail' });
// Definimos un esquema de mensaje
const mensajeSchema = new schema.Entity('mensajes', {
  id: idSchema,
  text: [textSchema],
  authors: [authorSchema],
  date: dateSchema,
});
// Definimos un esquema de posts
const postSchema = new schema.Entity('posts', {
  posts: [mensajeSchema],
});
//--------------------------------------------
// configuro el socket

io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado!');

  // carga inicial de productos
  const productos = await productosApi.listarAll();
  socket.emit('productos', productos);

  // actualizacion de productos
  socket.on('addProduct', async (newProd) => {
    const _ = await productosApi.guardar(newProd);
    const productos = await productosApi.listarAll();
    console.log('productos', productos);
    io.sockets.emit('productos', productos);
  });

  // carga inicial de mensajes
  const mensajes = await mensajesApi.listarAll();
  console.log('mensajes', mensajes);
  const mensajesN = normalize(mensajes, [postSchema]);
  socket.emit('mensajes', mensajesN);
  // actualizacion de mensajes
  socket.on('addMessage', async (newMessage) => {
    const _ = await mensajesApi.guardar(newMessage);
    const mensajes = await mensajesApi.listarAll();
    const messagesN = normalize(mensajes, postSchema);
    io.sockets.emit('mensajes', messagesN);
  });
});

//--------------------------------------------
// agrego middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        'mongodb+srv://rmacias:LXkNcbolg0BPR1Ne@cluster0.se8cs.mongodb.net/?retryWrites=true&w=majority',
      mongoOptions: advancedOptions,
    }),
    secret: 'secreto',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000,
    },
  })
);
//--------------------------------------------

app.get('/api/productos-test', (req, res) => {
  productos = [];
  for (i = 0; i < 5; i++) {
    productos.push({
      name: faker.commerce.product(),
      price: faker.commerce.price(),
      photo: faker.image.imageUrl(),
    });
  }
  res.send(productos);
});

app.post('/login', (req, res) => {
  console.log('Trying to login user', req.body.name);
  if (!req.session.name && req.body.name) {
    req.session.name = req.body.name;
  }
  res.render('main', { name: req.session.name });
});

app.get('/', (req, res) => {
  if (!req.session.name) {
    res.redirect('/login.html');
  } else {
    res.render('main', { name: req.session.name });
  }
});

// app.get('/login', (req, res) => {
//   res.sendFile('login.html', { root: '/public' });
// });
const getSessionName = (req) => req.session.name ?? '';
app.get('/logout', (req, res) => {
  res.render('logout', { name: getSessionName(req) });
  req.session.destroy();
});
//--------------------------------------------
// inicio el servidor

const PORT = 8080;
const connectedServer = httpServer.listen(PORT, () => {
  console.log(
    `Servidor http escuchando en el puerto ${connectedServer.address().port}`
  );
});
connectedServer.on('error', (error) =>
  console.log(`Error en servidor ${error}`)
);
