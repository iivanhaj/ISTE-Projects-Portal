require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = require('./routes/routes.js');
const app = express();
const PORT = process.env.PORT || 4000;
const helmet = require('helmet');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'your-external-styles-url'],
      scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      'unsafe-inline': ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/js/bootstrap.bundle.min.js'],
      'media-src': ["'self'", 'data:'],
    },
  })
);



//Database connection
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to database'));

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use((req,res,next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static('uploads'));

//Route prefix
app.use("", require("./routes/routes.js"));

// Set template engine
app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

