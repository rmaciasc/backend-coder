const yargs = require('yargs/yargs')(process.argv.slice(2));
const path = require('path');
const express = require('express');

const faker = require('faker');
const normalizr = require('normalizr');
const normalize = normalizr.normalize;
const schema = normalizr.schema;

const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const routes = require('./routes');
const controllersdb = require('./controllersdb');
const User = require('./models');

const MongoStore = require('connect-mongo');
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const { Server: HttpServer } = require('http');
const { Server: Socket } = require('socket.io');

const ContenedorSQL = require('./contenedores/ContenedorSQL.js');
const ContenedorFirebase = require('./contenedores/ContenedorFirebase');
const config = require('./config.js');
faker.locale = 'es';

//--------------------------------------------
// Yargs
const args = yargs
  .default({
    PORT: 8080,
  })
  .alias({ p: 'PORT' }).argv;

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
// instancio passport
passport.use(
  'login',
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        console.log('Email not found', email);
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!isValidPassword(user, password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  })
);

passport.use(
  'signup',
  new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, { message: 'Username already exists.' });
        }
        const newUser = {
          username: username,
          password: createHash(password),
          email: req.body.email,
        };

        User.create(newUser, (err, user) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
        });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

//--------------------------------------------
// Bcrypt isValidPassword
const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

//--------------------------------------------
// NORMALIZACI??N DE MENSAJES
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
      maxAge: config.TIEMPO_EXPIRACION,
      httpOnly: false,
      secure: false,
    },
  })
);
// inicio el servidor
app.use(passport.initialize());
app.use(passport.session());
function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}
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

app.get('/', routes.getRoot);
//LOGIN
app.get('/login', routes.getLogin);
app.post(
  '/login',
  passport.authenticate('login', { failureRedirect: '/faillogin' }),
  routes.postLogin
);
app.get('/faillogin', routes.getFailLogin);

//REGISTER
app.get('/signup', routes.getSignup);
app.post(
  '/signup',
  passport.authenticate('signup', { failureRedirect: '/failsignup' }),
  routes.postSignup
);
app.get('/failsignup', routes.getFailSignup);

const getSessionName = (req) => req.session.name ?? '';
app.get('/logout', routes.getLogout);

//INFO
app.get('/info', routes.getinfo);

// Child process
app.get('/api/randoms', routes.getRandoms);

//--------------------------------------------
// Connect to DB
const PORT = args.PORT;
controllersdb.conectarDB(config.URL_BASE_DE_DATOS, (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Base de datos conectada');
});

const connectedServer = httpServer.listen(PORT, () => {
  console.log(
    `Servidor http escuchando en el puerto ${connectedServer.address().port}`
  );
});
connectedServer.on('error', (error) =>
  console.log(`Error en servidor ${error}`)
);
