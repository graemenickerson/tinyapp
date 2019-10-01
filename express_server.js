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
}

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

// Check to see if the data input by user is vaild and not redundant
const validateUser = (user, users) => {
  if (user.email && user.password) {
    for (let element in users) {
      if(element.email === user.email) {
        return false;
      }
    }
    return true;
  }
  return false;
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
  let templateVars = {
    users,
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

// User can log in and is assigned a cookie
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// Logs user out and deletes cookie from browser
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// Shows page for creating new user
app.get("/urls/register", (req, res) => {
  let templateVars = {
    users
  };
  res.render("urls_register", templateVars);
});

// shows page for adding link to database
app.get("/urls/new", (req, res) => {
  let templateVars = {
    users
  };
  res.render("urls_new", templateVars);
});

// Shows page for editing a shortend link
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Adds new url to database for shortening
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

// Redirects shortUrl to longURL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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

// Takes user to detail page where can edit
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
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
    let templateVars = { users };
    res.status(400);
    res.render('urls_register', templateVars);
  }
});