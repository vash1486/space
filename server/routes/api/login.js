const express = require('express');
const router = express.Router();
const passport = require('passport');
const errors = require('./../../errors/api');

router.post('/login', (req, res, next) => {
  req.sanitizeBody(['username', 'password']).trim();
  req.sanitizeBody(['username', 'password']).escape();

  req.checkBody('username', 'no username').notEmpty().isAlphanumeric();
  req.checkBody('password', 'no password').notEmpty().isAscii();
  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        return next(new errors.FieldsValidationError(result.array()));
      }
      passport.authenticate('local', (err, account, info) => {
        if (err || !account) {
          return next(err);
        }

        req.logIn(account, (err) => {
          if (err) {
            return next(err);
          }

          res.status(200).json({
            user: req.user,
            token: req.user.getToken()
          });
        });
      })(req, res, next);
    });
});

router.get('/login/facebook', passport.authenticate('facebook'));

router.get('/login/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
  }, (accessToken, refreshToken, profile, done) => {
    console.log(accessToken, refreshToken, profile);
    res.sendStatus(200);
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  // TODO invalidare i token dell'utente
  req.logout();
  res.sendStatus(200);
});

module.exports = router;
