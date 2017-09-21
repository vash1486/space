process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const Account = require('./../../server/models/account');

const ApiUtility = require('./../utility/api');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./../../bin/www');
const should = chai.should();

chai.use(chaiHttp);

describe('Accounts', () => {
  const data = {
    uid: 0,
    token: ''
  };

  before((done) => {
    Account.remove({}, (err) => {
      done();
    });
  });

  describe('/POST api/account', () => {
    const makeDataObj = (username, password, confirm, birthday) => {
      return {
        username: username,
        password: password,
        confirm: confirm,
        birthday: birthday
      };
    };

    const runs = [{
        it: 'non si specifica username',
        data: makeDataObj(undefined, '1234', '1234', '1986-02-14'),
        fields: ['username']
      },
      {
        it: 'username non è esadecimale',
        data: makeDataObj('Ti@#zio', '1234', '1234', '1986-02-14'),
        fields: ['username']
      },
      {
        it: 'non si specifica la password',
        data: makeDataObj('Tizio', undefined, '1234', '1986-02-14'),
        fields: ['password', 'confirm']
      },
      {
        it: 'non si specifica confirm',
        data: makeDataObj('Tizio', '1234', undefined, '1986-02-14'),
        fields: ['confirm']
      },
      {
        it: 'confirm è diverso da password',
        data: makeDataObj('Tizio', '1234', '12345', '1986-02-14'),
        fields: ['confirm']
      },
      {
        it: 'la data di nascita non è valida',
        data: makeDataObj('Tizio', '1234', '1234', '19-86-02-14'),
        fields: ['birthday']
      }
    ];

    runs.forEach(run => {
      run.code = 400;
      run.url = '/api/account';
      run.it = 'Non crea un account se ' + run.it;
      ApiUtility.errorPost(run, data);
    });

    ApiUtility.successPost({
      url: '/api/account/',
      it: 'Crea un account',
      data: makeDataObj('Tizio', '1234', '1234', '1986-02-14'),
      callback: (err, res) => {
        res.body.should.have.property('token');
        res.body.should.have.property('user');
        res.body.user.should.have.property('username');
        res.body.user.username.should.be.eql('Tizio');
        data.uid = res.body.user._id;
        data.token = res.body.token;
      }
    }, data);

    ApiUtility.errorPost({
      code: 409,
      url: '/api/account',
      it: 'Non crea un account con un username già usato',
      data: makeDataObj('Tizio', '1234', '1234', '1986-02-14')
    }, data);
  });

  describe('/PUT api/account/:id', () => {
    ApiUtility.successPut({
      url: '/api/account/:id',
      it: 'Modifica un account',
      data: {
        birthday: '1987-01-24'
      },
      authorization: true,
      callback: (err, res) => {
        res.body.should.have.property('user');
        res.body.user.should.have.property('birthday');
        res.body.user.birthday.should.be.eql(new Date('1987-01-24').toISOString());
      }
    }, data);
  });

  describe('/PUT api/account/:id/password', () => {
    const makeDataObj = (oldpassword, newpassword, confirm) => {
      return {
        oldpassword: oldpassword,
        newpassword: newpassword,
        confirm: confirm
      };
    };

    const runs = [{
        it: 'oldpassword è sbagliata',
        data: makeDataObj('12345', '1234', '1234'),
        code: 401
      },
      {
        it: 'non si specifica oldpassword',
        data: makeDataObj(undefined, '1234', '1234'),
        fields: ['oldpassword']
      },
      {
        it: 'non si specifica newpassword',
        data: makeDataObj('1234', undefined, '1234'),
        fields: ['newpassword', 'confirm']
      },
      {
        it: 'non si specifica confirm',
        data: makeDataObj('1234', '1234', undefined),
        fields: ['confirm']
      },
      {
        it: 'confirm è diverso da password',
        data: makeDataObj('1234', '1234', '12345'),
        fields: ['confirm']
      }
    ];

    runs.forEach(run => {
      run.code = run.code || 400;
      run.authorization = true;
      run.url = '/api/account/:id/password';
      run.it = 'Non modifica la password se ' + run.it;
      ApiUtility.errorPut(run, data);
    });

    ApiUtility.successPut({
      url: '/api/account/:id/password',
      it: 'Modifica la password',
      data: makeDataObj('1234', '12345', '12345'),
      authorization: true,
      callback: (err, res) => {
        res.body.should.have.property('user');
      }
    }, data);
  });

  describe('/DELETE api/account/:id', () => {
    ApiUtility.errorDelete({
      code: 400,
      url: '/api/account/test',
      it: 'Non elimina un id non valido',
      authorization: true,
      fields: ['id']
    }, data);

    ApiUtility.errorDelete({
      code: 401,
      url: '/api/account/000ba4855a0a3b2c401a0123',
      it: 'Non elimina un account diverso da quello loggato',
      authorization: true
    }, data);

    ApiUtility.successDelete({
      url: '/api/account/:id',
      it: 'Elimina un account',
      authorization: true,
    }, data);
  });
});
