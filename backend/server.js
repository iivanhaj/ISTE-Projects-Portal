const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const User = require('./models/userModel');
const Project = require('./models/projectModel');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Database connection
mongoose.connect('mongodb+srv://admin:adminpassword@cluster0.4pdgmny.mongodb.net/?retryWrites=true&w=majority',
);

const db = mongoose.connection;

// Check for MongoDB connection success
db.once('open', async () => {
 console.log('Connected to MongoDB Atlas');
 // Check if an admin user exists
 const adminUser = await User.findOne({ username: 'admin' });

 if (!adminUser) {
    // If admin user doesn't exist, create one with a hashed password
    /*
    const plainPassword = 'admin';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    */
    const newAdminUser = new User({
      username: 'admin',
      password: 'admin',
    });

    try {
      await newAdminUser.save();
      console.log('Admin user created successfully');
    } catch (saveErr) {
      console.error('Error creating admin user:', saveErr);
    }
 }
});

// Check for MongoDB connection errors
db.on('error', (error) => {
 console.error('Error connecting to MongoDB Atlas:', error);
});

// Express middleware setup
app.use(express.json());

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  store: new (require('express-session').MemoryStore)(),
}));

app.use((req, res, next) => {
  console.log('Session:', req.session);
  next();
});

app.use(passport.initialize());
app.use(passport.session());
app.options('*', cors());

// Passport configuration
passport.serializeUser((user, done) => {
 done(null, user.id);
});

passport.deserializeUser((id, done) => {
 User.findById(id, (err, user) => {
    done(err, user);
 });
});

// Use the LocalStrategy within Passport to authenticate users
passport.use(new LocalStrategy(
 async function (username, password, done) {
    let user;
    try {
      user = await User.findOne({ username: username });
    } catch (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
 }
));

// Routes
// Login route
app.post('/login', passport.authenticate('local'), (req, res) => {
    console.log('User logged in:', req.user);
    console.log('Session after login:', req.session);    
    res.send(req.user);
});



// Serve the frontend files
app.use(express.static('frontend'));

app.get('/logout', (req, res) => {
 req.logout();
 res.json({ message: 'Logout successful' });
});

app.get('/profile', isAuthenticated, (req, res) => {
 res.json({ user: req.user });
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
 if (req.isAuthenticated()) {
    return next();
 } else {
    res.status(401).json({ message: 'Unauthorized' });
    return false;
 }
}

//Route to create a new project
app.post('/create-project', isAuthenticated, async (req, res) => {
  try {
    const { name, tagline, mainUrl, nameOfLink, images, description } = req.body;
    console.log('Data sent to server:', {
      name: projectName,
      tagline,
      mainUrl,
      nameOfLink,
      images: images.split(',').map(image => image.trim()),
      description,
    });

    // Create a new project
    const newProject = new Project({
      name,
      tagline,
      mainUrl,
      nameOfLink,
      images,
      description,
    });

    // Save the project to the database
    await newProject.save();

    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Start the server
app.listen(3001, () => {
 console.log('Server is running on port 3001!');
});