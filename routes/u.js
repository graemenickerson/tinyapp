// u.js
// Graeme Nickerson
// October 4, 2019

const express = require('express');
const router = express.Router();

const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const { generateRandomString, uniqueVisitor } = require('../libraries/helpers');
const { urlDatabase } = require('../libraries/databases');

router.use(bodyParser.urlencoded({extended: true}));
router.use(cookieSession({
  name: 'session',
  keys: ['l0ngKeYst1ng'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


// Redirects shortUrl to longURL website
router.get("/:shortURL", (req, res) => {
  const requestURL = req.params.shortURL;
  if (urlDatabase[requestURL]) {
    if (uniqueVisitor(req.session.hasVisited, urlDatabase[requestURL].visitors)) {
      req.session.hasVisited = generateRandomString();
      urlDatabase[requestURL].uniqueVisitors += 1;
    }
    urlDatabase[requestURL].urlVisits += 1;
    urlDatabase[requestURL].visitors.push( {[req.session.hasVisited]: new Date().toLocaleString('en-US', {timeZone: 'America/Vancouver'})});
    res.redirect(urlDatabase[requestURL].longURL);
  } else {
    res.status(404).send(`404 Not Found. Cannot find: localhost:8080/urls/${requestURL}`);
  }
});

module.exports = router;