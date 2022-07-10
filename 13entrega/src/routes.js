const yargs = require('yargs/yargs')(process.argv.slice(2));
const { fork } = require('child_process');
const numCpu = require('os').cpus().length;
const loggers = require('./loggers');

//--------------------------------------------
// Yargs
const args = yargs
  .default({
    PORT: 8080,
  })
  .alias({ p: 'PORT' }).argv;

function getRoot(req, res) {
  res.redirect('/welcome.html');
}
//--------------------------------------------
// loggers
const loggerConsola = loggers.loggerConsola;
const loggerWarn = loggers.loggerWarn;
//LOGIN
function getLogin(req, res) {
  if (req.isAuthenticated()) {
    const user = req.user;
    loggerConsola.info('user logueado');
    res.render('login-ok', {
      usuario: user.username,
      email: user.email,
    });
  } else {
    loggerConsola.info('user no logueado');
    loggerWarn.warn('user no logueado');
    res.redirect('/login.html');
  }
}

function getSignup(req, res) {
  res.sendFile(__dirname + '/views/signup.html');
}

function postLogin(req, res) {
  const user = req.user;
  res.render('main', { name: user.username, email: user.email });
}

function postSignup(req, res) {
  const user = req.user;
  res.render('main', { name: user.username, email: user.email });
}

function getFailLogin(req, res) {
  res.render('login-error', {});
}

function getFailSignup(req, res) {
  res.render('signup-error', {});
}

function getLogout(req, res) {
  req.logout();
  res.redirect('/');
}

function failRoute(req, res) {
  res.status(404).render('routing-error', {});
}

const getinfo = (req, res) => {
  const info = {
    'argumentos entrada': args,
    'path de ejecución': process.execPath,
    'nombre de la plataforma': process.platform,
    'process id': process.pid,
    'node version': process.version,
    'project folder': process.cwd,
    'rss memory': process.memoryUsage().rss,
    '# de CPUs': numCpu,
  };
  // console.log(info);
  res.json(info);
};

const getInfoConsole = (req, res) => {
  const info = {
    'argumentos entrada': args,
    'path de ejecución': process.execPath,
    'nombre de la plataforma': process.platform,
    'process id': process.pid,
    'node version': process.version,
    'project folder': process.cwd,
    'rss memory': process.memoryUsage().rss,
    '# de CPUs': numCpu,
  };
  console.log(info);
  res.json(info);
};

const getRandoms = (req, res) => {
  const qty = req.query.cant;
  const randoms = fork('src/randNumCount.js', [qty]);
  randoms.send({ message: 'start', qty: qty });
  randoms.on('message', (counts) => {
    res.json(counts);
  });
};

module.exports = {
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  getFailLogin,
  getFailSignup,
  getLogout,
  failRoute,
  getRoot,
  getinfo,
  getRandoms,
  getInfoConsole,
};
