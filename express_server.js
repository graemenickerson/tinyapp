// express_server.js
// Graeme Nickerson
// September 30, 2019s

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// Generates a String of alphanumeric characters that is 6 char long
const generateRandomString = function() {
  const data = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += data[Math.floor(Math.random() * data.length)];
  }
  return key;
}

// Adds new url to database for shortening
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString()
  urlDatabase[newShortURL] = req.body.longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${newShortURL}`);         // Respond with 'Ok' (we will replace this)
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
})

// Updates existing shortend url
app.post('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

// Takes user to detail page where can edit
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});
