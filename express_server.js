// express_server.js
// Graeme Nickerson
// September 30, 2019

// Server Setup
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

// Import Routes
app.use('/urls', require('./routes/urls'));
app.use('/u', require('./routes/u'));
app.use('/', require('./routes/loginPaths'));


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});