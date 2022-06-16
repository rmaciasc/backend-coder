const yargs = require('yargs/yargs')(process.argv.slice(2));
const { fork } = require('child_process');

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

//LOGIN
function getLogin(req, res) {
  if (req.isAuthenticated()) {
    const user = req.user;
    console.log('user logueado');
    res.render('login-ok', {
      usuario: user.username,
      email: user.email,
    });
  } else {
    console.log('user no logueado');
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
  res.json({
    'argumentos entrada': args,
    'path de ejecución': process.execPath,
    'nombre de la plataforma': process.platform,
    'process id': process.pid,
    'node version': process.version,
    'project folder': process.cwd,
    'rss memory': process.memoryUsage().rss,
  });
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
};
