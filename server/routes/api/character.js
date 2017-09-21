const express = require('express');
const router = express.Router();
const Character = require('./../../models/character');

router.use((req, res, next) => {
  return next(!req.user ? new errors.UnauthorizedError() : undefined);
});

router.get('/:id',(req,res,next) => {
  req.checkParams('id', 'no id').notEmpty().isMongoId();
  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        return next(new errors.FieldsValidationError(result.array()));
      }
      if (req.user._id !== req.params.id) return next(new errors.UnauthorizedError());

      return Character.findByAccount(req.params.id)
        .then((characters) => {
          return res.status(200).json(characters);
        });
    });
});

router.post('/', (req, res, next) => {
  req.checkBody('name', 'no name').notEmpty().isAlphanumeric();
  req.checkBody('surname', 'no surname').notEmpty().isAlphanumeric();
  req.getValidationResult()
    .then((result) => {
      console.log('post', result.array());
      if (!result.isEmpty()) {
        res.json(result.array());
      } else {
        Character.create({
          name: req.body.name,
          creation: new Date().getTime(),
          modified: new Date().getTime(),
          account: req.user._id
        }, (err, char) => {
          console.log(err, char);
          if (err) return next(err);
          res.json(char);
        });
      }
    });
});

router.put('/:id', (req, res, next) => {
  req.checkParams('id', 'Id non valido').notEmpty().isAlphanumeric();
  req.checkBody('name', 'Nome non valido').notEmpty().isAlphanumeric();

  req.getValidationResult()
    .then((result) => {
      console.log('put', result.array());
      if (!result.isEmpty()) {
        res.json(result.array());
      } else {
        Character.findByIdAndUpdate(req.params.id, {
          name: req.body.name,
          modified: new Date().getTime()
        }, (err, char) => {
          if (err) return next(err);
          res.json(char);
        });
      }
    });
});

router.delete('/:id', (req, res, next) => {
  req.checkParams('id', 'Id non valido').notEmpty().isAlphanumeric();
  req.getValidationResult().then((result) => {
    console.log('delete', result.array());
    if (!result.isEmpty()) {
      res.json(result.array());
    } else {
      Character.findByIdAndRemove(req.params.id, {}, (err, char) => {
        if (err) return next(err);
        res.json(char);
      });
    }
  });
});

router.get('/new', (req, res) => {
  res.render('characters/edit', {});
});

router.get('/:name', (req, res, next) => {
  req.checkParams('name', 'Nome non valido').notEmpty().isAlphanumeric();
  req.getValidationResult().then((result) => {
    console.log('get', result.array());
    if (!result.isEmpty()) {
      return next(result);
    }
    Character.findOne({
      'name': req.params.name
    }, (err, char) => {
      if (err) return next(err);
      res.json(char);
    });
  });
});

module.exports = router;
