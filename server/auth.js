const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jsonwebtoken');
const Account = require('./models/account');

module.exports = (app) => {
  // passport config
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(Account.serialize());
  passport.deserializeUser(Account.deserialize());

  passport.use('local', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, username, password, cb) => {
      Account.authenticate(username, password)
        .then((account) => {
          return cb(null, account);
        })
        .catch(cb);
    }));

  passport.use(new BearerStrategy((token, cb) => {
    jwt.verify(token, 'chiave-segretissima', (err, decoded) => {
      if (err) return cb(err);
      // TODO verificare che il token non sia stato cestinato
      return cb(null, decoded && decoded.user ? decoded.user : false);
    });
  }));
/*
  passport.use(new FacebookStrategy({
      clientID: '',
      clientSecret: '',
      callbackURL: "http://www.space.foo:3000/api/login/facebook/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // TODO finire il login con facebook
      console.log(accessToken, refreshToken, profile);
      return done(null, profile);
      /*
      User.findOrCreate(..., (err, user) => {
        if (err) { return done(err); }
        done(null, user);
      });
      * /
    }
  ));
*/
  app.all('*', (req, res, next) => {
    passport.authenticate('bearer', (err, user, info) => {
      if (err) return next(err);
      if (user) {
        req.user = user;
      }
      return next();
    })(req, res, next);
  });
};
