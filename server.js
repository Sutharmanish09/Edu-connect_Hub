const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Password reset request
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await users.findOne({ username: email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // Save token to database with expiration
    await users.updateOne({ _id: user._id }, { $set: { resetToken: token, resetTokenExpiration: Date.now() + 3600000 } });

    // Send email with reset link
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Error sending email' });
        }
        res.json({ message: 'Password reset link sent' });
    });
});

// Password reset
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    const user = await users.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await users.updateOne({ _id: user._id }, { $set: { password: hashedPassword }, $unset: { resetToken: "", resetTokenExpiration: "" } });

    res.json({ message: 'Password reset successful' });
});


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db, users;

// Connect to MongoDB
async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");

    db = client.db('authDatabase');
    users = db.collection('users');

    // Passport configuration
    passport.use(new GoogleStrategy({
      clientID: 'YOUR_GOOGLE_CLIENT_ID',
      clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
      callbackURL: 'http://localhost:3000/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await users.findOne({ googleId: profile.id });
        if (!user) {
          user = { googleId: profile.id, username: profile.emails[0].value };
          await users.insertOne(user);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));

    passport.use(new FacebookStrategy({
      clientID: 'YOUR_FACEBOOK_CLIENT_ID',
      clientSecret: 'YOUR_FACEBOOK_CLIENT_SECRET',
      callbackURL: 'http://localhost:3000/auth/facebook/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await users.findOne({ facebookId: profile.id });
        if (!user) {
          user = { facebookId: profile.id, username: profile.emails[0].value };
          await users.insertOne(user);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));

    passport.use(new LinkedInStrategy({
      clientID: 'YOUR_LINKEDIN_CLIENT_ID',
      clientSecret: 'YOUR_LINKEDIN_CLIENT_SECRET',
      callbackURL: 'http://localhost:3000/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await users.findOne({ linkedinId: profile.id });
        if (!user) {
          user = { linkedinId: profile.id, username: profile.emails[0].value };
          await users.insertOne(user);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));

    app.use(passport.initialize());

    // Sign-up route
    app.post('/signup', async (req, res) => {
      const { username, password } = req.body;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the user into the database
      const result = await users.insertOne({ username, password: hashedPassword });

      // Create a JWT token
      const token = jwt.sign({ userId: result.insertedId }, 'your_jwt_secret', { expiresIn: '1h' });

      res.status(201).json({ message: 'User created', token });
    });

    // Login route
    app.post('/login', async (req, res) => {
      const { username, password } = req.body;

      // Find the user in the database
      const user = await users.findOne({ username });

      if (user && await bcrypt.compare(password, user.password)) {
        // Create a JWT token
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });

    // Google OAuth routes
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
      const token = jwt.sign({ userId: req.user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.redirect(`/dashboard?token=${token}`);
    });

    // Facebook OAuth routes
    app.get('/auth/facebook', passport.authenticate('facebook'));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
      const token = jwt.sign({ userId: req.user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.redirect(`/dashboard?token=${token}`);
    });

    // LinkedIn OAuth routes
    app.get('/auth/linkedin', passport.authenticate('linkedin'));
    app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/' }), (req, res) => {
      const token = jwt.sign({ userId: req.user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.redirect(`/dashboard?token=${token}`);
    });

    // Middleware to authenticate token
    function authenticateToken(req, res, next) {
      const token = req.query.token;
      if (token == null) return res.sendStatus(401);

      jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    }

    // Dashboard route
    app.get('/dashboard', authenticateToken, (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    });

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);
