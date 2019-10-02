// express_server.js
// Graeme Nickerson
// September 30, 2019s

/* ------- Resources -------*/

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

/* ------- Databases ------- */

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

/* ------- Functions ------- */

// Generates a String of alphanumeric characters that is 6 char long
const generateRandomString = function() {
  const data = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += data[Math.floor(Math.random() * data.length)];
  }
  return key;
};

// Check to see if the data input by user is vaild and does not already exist
const validateUser = (newUser, users) => {
  if (newUser.email && newUser.password) {
    for (let user in users) {
      if (users[user].email === newUser.email) {
        return false;
      }
    }
    return true;
  }
  return false;
};

// Checks input user credentials agains user database and returns
// userId if valid returns false if not
const loginUser = (userID, users) => {
  for (let user in users) {
    if (users[user].email === userID.email && users[user].password === userID.password) {
      return user;
    }
  }
  return undefined;
};

/* ------- Path Requests ------- */

// Root directory path
app.get("/", (req, res) => {
  res.send("Hello! Goto http://localhost:8080/urls to access the tiny url app.");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Shows a page with the shortened urls
app.get('/urls', (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = {
      user: users[req.cookies['user_id']],
      urls: urlDatabase
    };
    res.render('urls_index', templateVars);
  } else {
    res.status(400);
    res.redirect('/urls/login');
  }
  
});

// Shows page for creating new user
app.get("/urls/register", (req, res) => {
  // let statCode = req.get('status');
  // console.log(statCode);
  res.render("urls_register");
});

// Shows login page
app.get('/urls/login', (req, res) => {
  res.render("urls_login");
});

// shows page for adding link to database
app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = {
      user: users[req.cookies['user_id']],
    };
    res.render('urls_new', templateVars);
  } else {
    res.status(400);
    res.redirect('/urls/login');
  }
});

// Shows page for editing a shortend link
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = {
      user: users[req.cookies['user_id']],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400);
    res.redirect('/urls/login');
  }
});

// Redirects shortUrl to longURL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Logs user out and deletes cookie from browser
app.post('/urls/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Adds new url to database for shortening
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

// Deletes selected url for database
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Updates existing shortend url
app.post('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

// Takes user info and compares to users database
app.post("/urls/login", (req, res) => {
  const userID = req.body;
  let user = loginUser(userID, users);
  if (user) {
    res.cookie('user_id', user);
    res.redirect('/urls');
  } else {
    res.status(403);
    res.render('urls_login_err');
  }
});

// Take new user info and stores it also assigns cookie
app.post('/urls/register', (req, res) => {
  const newUser = req.body;
  if (validateUser(newUser, users)) {
    const newUserId = generateRandomString();
    users[newUserId] = {
      id: newUserId,
      email: newUser.email,
      password: newUser.password
    };
    res.cookie('user_id', newUserId);
    res.redirect('/urls');
  } else {
    res.status(400);
    res.render('urls_register_err');
  }
});