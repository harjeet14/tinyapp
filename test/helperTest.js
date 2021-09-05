const { assert } = require('chai');
const bcrypt = require('bcrypt');
const saltrounds = 10;

const { getUserByEmail, generateRandomString, getUrlDatabaseFromUserId } = require('../helper.js');
const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('purple-monkey-dinosaur', saltrounds),
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('dishwasher-funk', saltrounds),
  }
};
const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'user2RandomID' },
};

describe('generateRandomString', function () {
  it('should return a string with six characters', function () {
    const randomStringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomStringLength, expectedOutput);
  });

  it('should not return the same string when called multiple times', function () {
    const firstRandomString = generateRandomString();
    const secondRandomString = generateRandomString();
    assert.notEqual(firstRandomString, secondRandomString);
  });
});

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers).id;
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
});
describe('getUrlDatabaseFromUserId  ', function () {

  it('should return an object of url information specific to the given user ID', function () {
    const specificUrls = getUrlDatabaseFromUserId(urlDatabase, 'userRandomID');
    const expectedOutput = {
      b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
    };
    assert.deepEqual(specificUrls, expectedOutput);
  });

  it('should return an empty object if no urls exist for a given user ID', function () {
    const noSpecificUrls = getUrlDatabaseFromUserId(urlDatabase, 'fakeUser');
    const expectedOutput = null;
    assert.deepEqual(noSpecificUrls, expectedOutput);
  });
});


