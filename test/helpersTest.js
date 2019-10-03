// helpersTest.js
// Graeme Nickerson
// October 2, 2019

const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {

  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should retun undefined with an invalid email', () => {
    const user = getUserByEmail('g@thenickersons.ca', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  })

});