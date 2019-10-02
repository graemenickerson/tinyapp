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

const bcrypt = require('bcrypt');

/* ------- Databases ------- */

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
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
    if (users[user].email === userID.email) {
      if (bcrypt.compareSync(userID.password, users[user].password)) {
        return user;
      }
    }
  }
  return undefined;
};

// Returns the urls associated with a user Id
const urlsForUser = (id) => {
  let results = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      results[url] = urlDatabase[url].longURL;
    }
  }
  return results;
};

/* ------- Path Requests ------- */

// Root directory path
app.get("/", (req, res) => {
  res.send("Hello! Goto http://localhost:8080/urls to access the tiny url app.");
});

// Shows a page with the shortened urls
app.get('/urls', (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = {
      user: users[req.cookies['user_id']],
      urls: urlsForUser(req.cookies['user_id'])
    };
    console.log(users);
    res.render('urls_index', templateVars);
  } else {
    res.status(400);
    res.redirect('/urls/login');
  }
});

// Shows page for creating new user
app.get("/urls/register", (req, res) => {
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
    res.redirect('/urls/login');
  }
});

// Shows page for editing a shortend link
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = {
      user: users[req.cookies['user_id']],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect('/urls/login');
  }
});

// Redirects shortUrl to longURL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Logs user out and deletes cookie from browser
app.post('/urls/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Adds new url to database for shortening
app.post("/urls", (req, res) => {
  if (req.cookies['user_id']) {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {};
    urlDatabase[newShortURL]['longURL'] = req.body.longURL;
    urlDatabase[newShortURL]['userID'] = req.cookies['user_id'];
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.redirect('/urls/login');
  }
});

// Deletes selected url for database
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/urls/login');
  }
});

// Updates existing shortend url
app.post('/urls/:shortURL/update', (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.redirect('/urls/login');
  }
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
    const hashPass = bcrypt.hashSync(newUser.password, 10);
    users[newUserId] = {
      id: newUserId,
      email: newUser.email,
      password: hashPass
    };
    res.cookie('user_id', newUserId);
    res.redirect('/urls');
  } else {
    res.status(400);
    res.render('urls_register_err');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});