const express = require('express');
const router = express.Router();
const passport = require('passport');
const Account = require('./../../models/account');
const errors = require('./../../errors/api');

router.post('/', (req, res, next) => {
  req.sanitizeBody('birthday').toDate();
  req.sanitizeBody(['username', 'password']).trim();
  req.sanitizeBody(['username', 'password']).escape();

  req.checkBody('username', 'no username').notEmpty().isAlphanumeric();
  req.checkBody('password', 'no password').notEmpty().isAscii();
  req.checkBody('confirm', 'confirm != password').isEqual(req.body.password);
  req.checkBody('birthday', 'no birthday').notEmpty();

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        return next(new errors.FieldsValidationError(result.array()));
      }

      Account.register({
          username: req.body.username,
          password: req.body.password,
          confirm: req.body.confirm,
          birthday: req.body.birthday,
        }).then(() => {
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
        })
        .catch(next);
    });
});

// da qui in poi l'utente deve essere loggato
router.use((req, res, next) => {
  return next(!req.user ? new errors.UnauthorizedError() : undefined);
});

router.put('/:id', (req, res, next) => {
  req.sanitizeParams('id').trim();
  req.sanitizeParams('id').escape();
  req.sanitizeBody('birthday').toDate();

  req.checkParams('id', 'no id').notEmpty().isMongoId();
  req.checkBody('birthday', 'no birthday').notEmpty();

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        return next(new errors.FieldsValidationError(result.array()));
      }
      if (req.user._id !== req.params.id) return next(new errors.UnauthorizedError());

      Account.findById(req.params.id)
        .then((account) => {
          account.birthday = new Date(req.body.birthday);
          return account.save()
            .then(function(updated) {
              res.status(200).json({
                user: updated
              });
            });
        })
        .catch(function(err) {
          return next(err);
        });
    });
});

router.put('/:id/password', (req, res, next) => {
  // modifica la password dell'account specificato
  req.sanitizeParams('id').trim();
  req.sanitizeParams('id').escape();
  req.sanitizeBody(['oldpassword', 'newpassword']).trim();
  req.sanitizeBody(['oldpassword', 'newpassword']).escape();

  req.checkParams('id', 'no id').notEmpty().isMongoId();
  req.checkBody('oldpassword', 'no oldpassword').notEmpty().isAscii();
  req.checkBody('newpassword', 'no newpassword').notEmpty().isAscii();
  req.checkBody('confirm', 'confirm != newpassword').isEqual(req.body.newpassword);

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        return next(new errors.FieldsValidationError(result.array()));
      }
      if (req.user._id !== req.params.id) return next(new errors.UnauthorizedError());
      Account.findById(req.params.id)
        .then((account) => {
          return account.changePassword(req.body.oldpassword, req.body.newpassword)
            .then((account) => {
              req.logIn(account, (err) => {
                if (err) {
                  return next(err);
                }

                res.status(200).json({
                  user: req.user,
                  token: req.user.getToken()
                });
              });
            });
        })
        .catch(function(err) {
          return next(err);
        });
    });
});

router.delete('/:id', (req, res, next) => {
  // elimina l'account specificato
  req.checkParams('id', 'no id').notEmpty().isMongoId();
  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        return next(new errors.FieldsValidationError(result.array()));
      }
      if (req.user._id !== req.params.id) return next(new errors.UnauthorizedError());

      return Account.findById(req.params.id)
        .then((account) => {
          return account.remove()
            .then(() => {
              res.sendStatus(200);
            });
        });
    });
});

router.get('/:username', (req, res, next) => {
  req.checkParams('username', 'no username').notEmpty().isAlphanumeric();

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        return next(new errors.FieldsValidationError(result.array()));
      }

      Account.findByUsername(req.params.username)
        .then((account) => {
          res.status(200).json(account);
        });
    });
});

module.exports = router;
