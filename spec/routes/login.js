process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Account = require('./../../server/models/account');

const ApiUtility = require('./../utility/api');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../../bin/www');
let should = chai.should();

chai.use(chaiHttp);

describe('Logins', () => {
  const data = {
    uid: 0,
    token: ''
  };
  before((done) => {
    Account.register({
        username: 'TestLogin',
        password: '1234',
        confirm: '1234',
        birthday: '1986-02-14',
      }).then((account) => {
        done();
      });
  });

  describe('/POST api/login', () => {
    const makeDataObj = (username, password) => {
      return {
        username: username,
        password: password
      };
    };

    const runs = [{
        it: 'non c\'è username',
        data: makeDataObj(undefined, '1234'),
        fields: ['username']
      },
      {
        it: 'username non è esadecimale',
        data: makeDataObj('Tiz#@io', '1234'),
        fields: ['username']
      },
      {
        it: 'non c\'è la password',
        data: makeDataObj('Tizio', undefined),
        fields: ['password']
      },
      {
        it: 'l\'account non esiste',
        data: makeDataObj('Caio', '1234'),
        code: 401
      },
      {
        it: 'la password è sbagliata',
        data: makeDataObj('TestLogin', '123456'),
        code: 401
      }
    ];

    runs.forEach(run => {
      run.code = run.code || 400;
      run.url = '/api/login';
      run.it = 'Non logga se ' + run.it;
      ApiUtility.errorPost(run, data);
    });

    ApiUtility.successPost({
      url: '/api/login',
      it: 'Logga un account',
      data: makeDataObj('TestLogin', '1234'),
      callback: (err, res) => {
        res.body.should.have.property('token');
        res.body.should.have.property('user');
        res.body.user.should.have.property('username');
        res.body.user.username.should.be.eql('TestLogin');
        data.uid = res.body.user._id;
        data.token = res.body.token;
      }
    }, data);
  });

  describe('/POST api/logout', () => {
    ApiUtility.successPost({
      url: '/api/logout',
      it: 'Slogga un account'
    }, data);
  });
});
