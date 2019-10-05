// loginPaths.js
// Graeme Nickerson
// October 3, 2019

const express = require('express');
const router = express.Router();
const { users } = require('../libraries/databases');
const { getUserByEmail, generateRandomString, urlsForUser, uniqueVisitor, countUnique } = require('../libraries/helpers');

const cookieSession = require('cookie-session');

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