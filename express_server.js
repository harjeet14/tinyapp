const PORT = 8080;         // default port 8080

const express = require("express");
const morgan = require('morgan'); //middleware to log HTTP requests and errors
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltrounds = 10;
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, getUrlDatabaseFromUserId } = require('./helper.js');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');    // tells ejs to
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomId" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomId" }
};

const users = {};

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[user_id] };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => { //post request for  login
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;

  if (!inputEmail || !inputPassword) {
    res.statusCode = 403;
    res.send("Email and Password should not be empty");
    return;
  }
  const user = getUserByEmail(inputEmail, users);

  if (!user) {
    res.statusCode = 403;
    res.send("User doesn't exist");
    return;
  } else if (!bcrypt.compareSync(inputPassword, user.password)) {
    res.statusCode = 403;
    res.send("password Incorrect");
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//post request for logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//show form to register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const randomUserId = generateRandomString();
  if (!inputEmail || !inputPassword) {
    res.statusCode = 400;
    res.send(" Incorrect username and password");
    return;
  }
  if (getUserByEmail(inputEmail, users)) {
    res.status(400);
    res.send("Email already exist");
    return;
  }
  if (users[inputEmail]) {
    res.send("Email already exist");
    return;
  } else {
    const hashedPassword = bcrypt.hashSync(inputPassword, saltrounds);
    // generate id . lets assume that is userId
    users[randomUserId] = {
      id: randomUserId,
      email: inputEmail,
      password: hashedPassword
    };
    console.log(users);
    req.session.user_id = randomUserId;
    res.redirect('/urls');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id; //get cookie
  if (!user_id) {
    res.redirect('/login');
  } else {
    const templateVars = { user: users[user_id] };
    res.render("urls_new", templateVars);
  }
});

app.get("/", (req, res) => {
  res.redirect('/urls/');
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const user_id = req.session.user_id;
    const urls_userid = getUrlDatabaseFromUserId(urlDatabase, user_id);
    const templateVars = { urls: urls_userid, user: users[user_id] };
    res.render("urls_index", templateVars);
  } else {
    const user_id = req.session.user_id;
    const templateVars = { user: users[user_id] };
    res.render("redirect_login", templateVars);
  }

});

// post request to generate random shortUrl
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const longUrl = req.body.longURL;
    const shortUrl = generateRandomString();
    const user_id = req.session.user_id;
    urlDatabase[shortUrl] = { longURL: longUrl, userID: user_id };
    res.redirect("/urls/" + shortUrl);
  }
});

// GET api to redirect to the Edit page
app.get("/urls/edit/:shortURL", (req, res) => {
  if (checkLoginAndAuthorization(req, res, urlDatabase)) {
    const shorturl = req.params.shortURL;
    res.redirect("/urls/" + shorturl);
  }
});

// post request to delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  if (checkLoginAndAuthorization(req, res, urlDatabase)) {
    const urlDelete = req.params.shortURL;
    delete urlDatabase[urlDelete];
    res.redirect('/urls');
  }
});

// post request to edit urls
app.post("/urls/:shortURL/edit", (req, res) => {
  if (checkLoginAndAuthorization(req, res, urlDatabase)) {
    const urlEditShortUrl = req.params.shortURL;
    const urlEditLongUrl = req.body.longURL;
    const existingUrl = urlDatabase[urlEditShortUrl];
    existingUrl.longURL = urlEditLongUrl;
    urlDatabase[urlEditShortUrl] = existingUrl;
    res.redirect('/urls/');
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.statusCode = 403;
    res.send("The requested link is invalid");
    return false;
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls/:shortURL", (req, res) => {

  if (checkLoginAndAuthorization(req, res, urlDatabase)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  }
});

const checkLoginAndAuthorization = function (req, res, urlsdb) {
  const user_id = req.session.user_id;
  if (user_id) {
    if (!urlsdb[req.params.shortURL]) {
      res.statusCode = 403;
      res.send("The requested link is invalid");
      return false;
    }
    else if (urlsdb[req.params.shortURL].userID !== user_id) {
      res.statusCode = 403;
      res.send("You are not authorized to access this link");
      return false;
    }
    return true;
  } else {
    res.redirect('/urls/');
  }
};

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});