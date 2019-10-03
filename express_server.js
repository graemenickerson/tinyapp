// express_server.js
// Graeme Nickerson
// September 30, 2019s

/* ------- Resources -------*/

// Imports
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')
const bcrypt = require('bcrypt');

// Set-up middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['l0ngKeYst1ng'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));

//Import Functions
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');


/* ------- Databases ------- */

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: '$2b$10$t5erq/lVSdRNHtAXYGnJ8.RpWRYfC/MeCNb8omFl4tNZih7ussz2S'
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

/* ------- Path Requests ------- */

// Root directory path
app.get("/", (req, res) => {
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

// Shows main page with the shortened urls a user has created
app.get('/urls', (req, res) => {
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
app.get("/urls/new", (req, res) => {
  if (req.session.userLogin) {
    let templateVars = {
      user: users[req.session.userLogin],
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/urls/login');
  }
});

// Shows page for editing a shortend link
app.get("/urls/:shortURL", (req, res) => {
  let requestURL = req.params.shortURL;
  if (req.session.userLogin) {
    if (urlDatabase[requestURL]) {
      if (urlDatabase[requestURL].userID === req.session.userLogin) {
        let templateVars = {
          user: users[req.session.userLogin],
          shortURL: requestURL,
          longURL: urlDatabase[requestURL].longURL
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

// Redirects shortUrl to longURL website
app.get("/u/:shortURL", (req, res) => {
  const requestURL = req.params.shortURL;
  if (urlDatabase[requestURL]) {
    const longURL = urlDatabase[requestURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send(`404 Not Found. Cannot find: localhost:8080/urls/${requestURL}`);
  }
});

// Adds new url to database for shortening
app.post("/urls", (req, res) => {
  if (req.session.userLogin) {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {};
    urlDatabase[newShortURL]['longURL'] = req.body.longURL;
    urlDatabase[newShortURL]['userID'] = req.session.userLogin;
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.status(401).send(`401 Unauthorized. You do not have permission: localhost:8080/urls`);
  }
});

// Updates existing shortend url
app.put('/urls/:shortURL', (req, res) => {
  let requestURL = req.params.shortURL;
  if (req.session.userLogin === urlDatabase[requestURL].userID) {
    urlDatabase[requestURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.status(401).send(`401 Unauthorized. You do not have permission: localhost:8080/urls/${requestURL}`);
  }
});

// Deletes selected url from database
app.delete('/urls/:shortURL', (req, res) => {
  let requestURL = req.params.shortURL;
  if (req.session.userLogin === urlDatabase[requestURL].userID) {
    delete urlDatabase[requestURL];
    res.redirect('/urls');
  } else {
    res.status(401).send(`401 Unauthorized. You do not have permission: localhost:8080/urls/${requestURL}`);
  }
});

// Shows login page
app.get('/login', (req, res) => {
  if (req.session.userLogin) {
    res.redirect('/urls');
  } else {
    res.render("urls_login");
  }
});

// Shows page for creating new user
app.get("/register", (req, res) => {
  if (req.session.userLogin) {
    res.redirect('/urls');
  } else {
    res.render("urls_register");
  }
});

// Takes user info and compares to users database
app.post("/login", (req, res) => {
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
app.post('/register', (req, res) => {
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
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});