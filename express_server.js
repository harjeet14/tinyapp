const PORT = 8080;         // default port 8080
const express = require("express");
const cookieParser = require('cookie-parser');
const morgan = require('morgan'); //middleware to log HTTP requests and errors
const app = express();
const bodyParser = require("body-parser");//

app.use(morgan('dev'));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');    // tells ejs to

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {

};

function generateRandomString() {
  let result = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charlen = char.length;
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * charlen));
  }
  return result;
};

const getUserByEmail = function (email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }

  return null;
}

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id']; //get cookie
  const templateVars = { user: users[user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[user_id] }
  res.render("urls_index", templateVars);
});
app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[user_id] }
  res.render("login", templateVars);
})
//post request for username login 
app.post("/login", (req, res) => {

  let inputEmail = req.body.email;
  let inputPassword = req.body.password;

  if (!inputEmail || !inputPassword) {
    res.statusCode = 403;
    res.send("Email and Password should not be empty")
    return;
  }
  const user = getUserByEmail(inputEmail);

  if (!user) {
    res.statusCode = 403;
    res.send("User doesn't exist")
    return;
  } else if (user.password !== inputPassword) {
    res.statusCode = 403;
    res.send("password Incorrect");
    return;
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//post request for logout
app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/urls");
});

// post request to generate random shortUrl      
app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL;
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = longUrl;
  res.redirect("/urls/" + shortUrl);
});

// POST request to update resource
app.post("/urls/:id", (req, res) => {
  let newlongUrl = req.body.longURL;
  let shorturl = req.params.id;
  urlDatabase[shorturl] = newlongUrl;
  res.redirect('/urls/');
});

// GET api to redirect to the Edit page
app.get("/urls/edit/:id", (req, res) => {
  let shorturl = req.params.id;
  console.log(shorturl);
  res.redirect("/urls/" + shorturl);
});

// post request to delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlDelete = req.params.shortURL;
  delete urlDatabase[urlDelete];
  res.redirect('/urls');
});
//show form to login
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  const inputName = req.body.name;
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const randomUserId = generateRandomString();
  if (!inputEmail || !inputPassword) {
    res.statusCode = 400;
    res.send(" Incorrect username and password");
    return;
  };
  if (getUserByEmail(inputEmail)) {
    res.status(400);
    res.send("Email already exist")
    return;
  }
  if (users[inputEmail]) {
    console.log("Email already exist");
    res.send("Email already exist");
    return
  } else {

    // generate id . lets assume that is userId
    users[randomUserId] = {
      id: randomUserId,
      email: inputEmail,
      password: inputPassword
    }
    console.log(users);
    res.cookie('user_id', randomUserId)
    res.redirect('/urls')
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[user_id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});