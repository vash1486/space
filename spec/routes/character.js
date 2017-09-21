process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const Account = require('./../../server/models/account');
const Character = require('./../../server/models/character');
const Race = require('./../../server/models/race');
const Skill = require('./../../server/models/skill');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./../../bin/www');
const should = chai.should();

chai.use(chaiHttp);

describe('Character', () => {
  before((done) => {
    Character.remove({}, (err) => {
      done();
    });
  });
/*
  describe('/POST api/character', () => {
    const makeDataObj = (account, name, surname, flag, race, skills) => {
      return {
        account: account,
        name: name,
        surname: surname,
        flag: flag,
        race: race,
        skills: skills
      };
    };

    const runs = [{
        it: 'non si specifica account',
        data: makeDataObj(undefined, '1234', '1234', '1986-02-14')
      },
      {
          it: 'account non è un id valido',
          data: makeDataObj('test', '1234', '1234', '1986-02-14')
      },
      {
        it: 'non si specifica name',
        data: makeDataObj(undefined, '1234', '1234', '1986-02-14')
      },
      {
        it: 'name non è esadecimale',
        data: makeDataObj('Ti@#zio', '1234', '1234', '1986-02-14')
      },
      {
        it: 'non si specifica surname',
        data: makeDataObj('Tizio', undefined, '1234', '1986-02-14')
      }
    ];

    runs.forEach(function(run) {
      it('Non crea un personaggio se ' + run.it, (done) => {
        chai.request(server)
          .post('/api/account')
          .send(run.data)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status');
            res.body.status.should.be.eql('error');
            done();
          });
      });
    });

    it('Crea un personaggio', (done) => {
      let account = {
        username: 'Tizio',
        password: '1234',
        confirm: '1234',
        birthday: '1986-02-14'
      };
      chai.request(server)
        .post('/api/account')
        .send(account)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.should.have.property('user');
          res.body.user.should.have.property('username');
          res.body.user.username.should.be.eql('Tizio');
          uid = res.body.user._id;
          token = res.body.token;
          done();
        });
    });

    it('Non crea un account con un username già usato', (done) => {
      let account = {
        username: 'Tizio',
        password: '12345',
        confirm: '12345',
        birthday: '1986-02-14'
      };
      chai.request(server)
        .post('/api/account')
        .send(account)
        .end((err, res) => {
          res.should.have.status(409);
          res.body.should.be.a('object');
          res.body.should.have.property('status');
          res.body.status.should.be.eql('error');
          done();
        });
    });
  });

  describe('/PUT api/account/:id', () => {
    it('Modifica un account', (done) => {
      let account = {
        birthday: '1987-01-24'
      };
      chai.request(server)
        .put('/api/account/' + uid)
        .set('Authorization', 'Bearer ' + token)
        .send(account)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.user.should.have.property('birthday');
          res.body.user.birthday.should.be.eql(new Date('1987-01-24').toISOString());
          done();
        });
    });
  });

  describe('/PUT api/account/password/:id', () => {
    const makeDataObj = (oldpassword, newpassword, confirm) => {
      return {
        oldpassword: oldpassword,
        newpassword: newpassword,
        confirm: confirm
      };
    };

    const runs = [{
        it: 'oldpassword è sbagliata',
        data: makeDataObj('Tizio', '1234', '1234', '19-86-02-14')
      },
      {
        it: 'non si specifica oldpassword',
        data: makeDataObj(undefined, '1234', '1234')
      },
      {
        it: 'non si specifica newpassword',
        data: makeDataObj('1234', undefined, '1234')
      },
      {
        it: 'non si specifica confirm',
        data: makeDataObj('1234', '1234', undefined)
      },
      {
        it: 'confirm è diverso da password',
        data: makeDataObj('1234', '1234', '12345')
      }
    ];

    runs.forEach(function(run) {
      it('Non modifica la password se ' + run.it, (done) => {
        chai.request(server)
          .post('/api/account')
          .send(run.data)
          .set('Authorization', 'Bearer ' + token)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status');
            res.body.status.should.be.eql('error');
            done();
          });
      });
    });

    it('Modifica la password', (done) => {
      let account = {
        oldpassword: '1234',
        newpassword: '12345',
        confirm: '12345'
      };
      chai.request(server)
        .put('/api/account/' + uid)
        .set('Authorization', 'Bearer ' + token)
        .send(account)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          done();
        });
    });
  });

  describe('/DELETE api/account/:id', () => {
    it('Non elimina un id non valido', (done) => {
      chai.request(server)
        .delete('/api/account/test')
        .set('Authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('status');
          res.body.status.should.be.eql('error');
          done();
        });
    });

    it('Non elimina un account diverso da quello loggato', (done) => {
      chai.request(server)
        .delete('/api/account/000ba4855a0a3b2c401a0123')
        .set('Authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('status');
          res.body.status.should.be.eql('error');
          done();
        });
    });

    it('Elimina un account', (done) => {
      chai.request(server)
        .delete('/api/account/' + uid)
        .set('Authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });*/
});
