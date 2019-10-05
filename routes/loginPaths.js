// loginPaths.js
// Graeme Nickerson
// October 3, 2019

const express = require('express');
const router = express.Router();

const { users } = require('../libraries/databases');
const { generateRandomString, urlsForUser, getUserByEmail } = require('../libraries/helpers');

const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({extended: true}));
router.use(cookieSession({
  name: 'session',
  keys: ['l0ngKeYst1ng'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Root directory path
router.get("/", (req, res) => {
  if (req.session.userLogin) {
    let templateVars = {
      user: users[req.session.userLogin],
      urls: urlsForUser(req.session.userLogin)
    };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Shows login page
router.get('/login', (req, res) => {
  if (req.session.userLogin) {
    res.redirect('/urls');
  } else {
    res.render("urls_login");
  }
});

// Shows page for creating new user
router.get("/register", (req, res) => {
  if (req.session.userLogin) {
    res.redirect('/urls');
  } else {
    res.render("urls_register");
  }
});

// Takes user info and compares to users database
router.post("/login", (req, res) => {
  const userEmail = req.body.email;
  let user = getUserByEmail(userEmail, users);
  if (user && bcrypt.compareSync(req.body.password, users[user].password)) {
    req.session.userLogin = user;
    res.redirect('/urls');
  } else {
    res.status(403);
    res.render('urls_login_err');
  }
});

// Take new user info and stores it also assigns cookie
router.post('/register', (req, res) => {
  const newUser = req.body;
  if (getUserByEmail(newUser.email, users) === undefined) {
    const newUserId = generateRandomString();
    const hashPass = bcrypt.hashSync(newUser.password, 10);
    users[newUserId] = {
      id: newUserId,
      email: newUser.email,
      password: hashPass
    };
    req.session.userLogin = newUserId;
    res.redirect('/urls');
  } else {
    res.status(400);
    res.render('urls_register_err');
  }
});

// Logs user out and deletes cookie from browser
router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

module.exports = router;