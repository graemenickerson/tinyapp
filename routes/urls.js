// urls.js
// Graeme Nickeson
// October 3, 2019

const express = require('express');
const router = express.Router();

const { urlDatabase, users } = require('../libraries/databases');
const { generateRandomString, urlsForUser, countUnique } = require('../libraries/helpers');

const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride('_method'));
router.use(cookieSession({
  name: 'session',
  keys: ['l0ngKeYst1ng'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

router.get('/', (req, res) => {
  if (req.session.userLogin) {
    let templateVars = {
      user: users[req.session.userLogin],
      urls: urlsForUser(req.session.userLogin, urlDatabase)
    };
    res.render('urls_index', templateVars);
  } else {
    res.status(401).send(`401 Unauthorized. You do not have permission: localhost:8080/urls`);
  }
});

// Shows page for adding a link to the database
router.get("/new", (req, res) => {
  if (req.session.userLogin) {
    let templateVars = {
      user: users[req.session.userLogin],
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/urls/login');
  }
});

// Shows page for editing a shortend link and viewing details
router.get("/:shortURL", (req, res) => {
  let requestURL = req.params.shortURL;
  if (req.session.userLogin) {
    if (urlDatabase[requestURL]) {
      if (urlDatabase[requestURL].userID === req.session.userLogin) {
        let templateVars = {
          user: users[req.session.userLogin],
          shortURL: requestURL,
          longURL: urlDatabase[requestURL].longURL,
          dateCreated: urlDatabase[requestURL].dateCreated,
          urlVisits: urlDatabase[requestURL].urlVisits,
          uniqueVisitors: countUnique(urlDatabase[requestURL].visitors),
          visitors: urlDatabase[requestURL].visitors
        };
        res.render("urls_show", templateVars);
      } else {
        res.status(401).send(`401 Unauthorized. You do not have permission: localhost:8080/urls/${requestURL}`);
      }
    } else {
      res.status(404).send(`404 Not Found. Cannot find: localhost:8080/urls/${requestURL}`);
    }
  } else {
    res.status(401).send(`401 Unauthorized. You do not have permission: localhost:8080/urls/${requestURL}`);
  }
});

// Adds new url to database for shortening
router.post("/", (req, res) => {
  if (req.session.userLogin) {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {};
    urlDatabase[newShortURL]['longURL'] = req.body.longURL;
    urlDatabase[newShortURL]['userID'] = req.session.userLogin;
    urlDatabase[newShortURL]['dateCreated'] = new Date().toLocaleDateString('en-US', {timeZone: 'America/Vancouver'});
    urlDatabase[newShortURL]['urlVisits'] = 0;
    urlDatabase[newShortURL]['uniqueVisitors'] = 0;
    urlDatabase[newShortURL]['visitors'] = [];
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.status(401).send(`401 Unauthorized. You do not have permission: localhost:8080/urls`);
  }
});

// Updates existing shortend url
router.put('/:shortURL', (req, res) => {
  let requestURL = req.params.shortURL;
  if (req.session.userLogin === urlDatabase[requestURL].userID) {
    urlDatabase[requestURL].longURL = req.body.longURL;
    urlDatabase[requestURL].dateCreated = new Date().toLocaleDateString('en-US');
    urlDatabase[requestURL].urlVisits = 0;
    urlDatabase[requestURL].uniqueVisitors = 0;
    urlDatabase[requestURL].visitors = [];
    res.redirect('/urls');
  } else {
    res.status(401).send(`401 Unauthorized. You do not have permission: localhost:8080/urls/${requestURL}`);
  }
});

// Deletes selected url from database
router.delete('/:shortURL', (req, res) => {
  let requestURL = req.params.shortURL;
  if (req.session.userLogin === urlDatabase[requestURL].userID) {
    delete urlDatabase[requestURL];
    res.redirect('/urls');
  } else {
    res.status(401).send(`401 Unauthorized. You do not have permission: localhost:8080/urls/${requestURL}`);
  }
});

module.exports = router;