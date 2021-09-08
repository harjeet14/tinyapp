//const bcrypt = require('bcrypt');



//create email lookup helper function
const getUserByEmail = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const generateRandomString = function () {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charlen = char.length;
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * charlen));
  }
  return result;
};

const getUrlDatabaseFromUserId = function (urlDatabase, userId) {
  const returnUrlObject = {};
  for (const urls in urlDatabase) {
    if (urlDatabase[urls].userID === userId) {
      returnUrlObject[urls] = {};
      returnUrlObject[urls].longURL = urlDatabase[urls].longURL;
      returnUrlObject[urls].userID = urlDatabase[urls].userID;
    }
  }
  if (Object.keys(returnUrlObject).length === 0) {
    return null;
  } else {
    return returnUrlObject;
  }
};
module.exports = { getUserByEmail, generateRandomString, getUrlDatabaseFromUserId };
