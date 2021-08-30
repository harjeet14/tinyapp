const PORT = 8080;         // default port 8080
const express = require("express");
const cookieParser = require('cookie-parser');
const morgan = require('morgan'); //middleware to log HTTP requests and errors
const app = express();
const bodyParser = require("body-parser");//

app.use(morgan('dev'));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');    // set ejs as view engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// post request to generate random shortUrl      
app.post("/urls", (req, res) => {

  let longUrl = req.body.longURL
  let shortUrl = generateRandomString()
  urlDatabase[shortUrl] = longUrl
  res.redirect("/urls/" + shortUrl)
});
// POST request to update resource
app.post("/urls/:id", (req, res) => {
  let newlongUrl = req.body.longURL
  let shorturl = req.params.id
  urlDatabase[shorturl] = newlongUrl
  res.redirect('/urls/');
});
// GET api to redirect to the Edit page
app.get("/urls/edit/:id", (req, res) => {
  let shorturl = req.params.id
  console.log(shorturl);
  res.redirect("/urls/" + shorturl);
});

// post request to delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlDelete = req.params.shortURL;
  delete urlDatabase[urlDelete];
  res.redirect('/urls');
});


app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL])

});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});