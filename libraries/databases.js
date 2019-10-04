// databases.js
// Graeme Nickerson
// October 3, 2019

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW", dateCreated: '10/3/2019', urlVisits: 0, uniqueVisitors: 0, visitors:[]},
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW", dateCreated: '10/3/2019', urlVisits: 0, uniqueVisitors: 0, visitors:[] }
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

module.exports = {
  urlDatabase,
  users
};