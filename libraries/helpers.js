// helpers.js
// Graeme Nickerson
// October 2, 2019


// Checks input user email against user database and returns
// userId if present and returns undefined if not.
const getUserByEmail = (email, database) => {
  let user = undefined;
  for (let element in database) {
    if (database[element].email === email) {
      user = element;
    }
  }
  return user;
};

// Generates a String of alphanumeric characters that is 6 char long
const generateRandomString = () => {
  const data = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += data[Math.floor(Math.random() * data.length)];
  }
  return key;
};

// Returns the urls associated with a user Id
const urlsForUser = (id, database) => {
  let results = {};
  for (let url in database) {
    if (database[url].userID === id) {
      results[url] = [database[url].longURL, database[url].dateCreated];
    }
  }
  return results;
};

// Checks to see if a user has used the short link before
const uniqueVisitor = (id, visitors) => {
  if (visitors.findIndex((i => Object.keys(i)[0] === id)) === -1) {
    return true;
  }
  return false;
};

// Returns the number of unique visitors to a short link
const countUnique = (visitors) => {
  let unqID = [];
  for (let user of visitors) {
    unqID.push(Object.keys(user)[0]);
  }
  return new Set(unqID).size;
}

module.exports = { 
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  uniqueVisitor,
  countUnique
 };