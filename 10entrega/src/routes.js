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
  res.sendFile('index.html');
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
};
