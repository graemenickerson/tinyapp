// helpers.js
// Graeme Nickerson
// October 2, 2019


// Checks input user email against user database and returns
// userId if present and returns undefined if not.
const getUserByEmail = function(email, database) {
  let user = undefined;
  for (let element in database) {
    if (database[element].email === email) {
      user = element;
    }
  }
  return user;
};

module.exports = { getUserByEmail };