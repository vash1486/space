const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./../../bin/www');
const should = chai.should();

chai.use(chaiHttp);

const errorCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  409: 'Conflict'
};

module.exports = {
  successPost: (run, data) => {
    success('post', run, data);
  },
  errorPost: (run, data) => {
    error('post', run, data);
  },
  successPut: (run, data) => {
    success('put', run, data);
  },
  errorPut: (run, data) => {
    error('put', run, data);
  },
  successDelete: (run, data) => {
    success('delete', run, data);
  },
  errorDelete: (run, data) => {
    error('delete', run, data);
  },
  successGet: (run, data) => {
    success('get', run, data);
  },
  errorGet: (run, data) => {
    error('get', run, data);
  }
};

function error(method, run, data) {
  it(run.it, (done) => {
    const request = prepareRequest(method, run, data);

    request.send(run.data)
      .end((err, res) => {
        res.should.have.status(run.code);
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.status.should.be.eql('error');
        res.body.should.have.property('message');
        res.body.message.should.be.eql(errorCodes[run.code]);

        if(typeof run.fields !== 'undefined') {
          res.body.should.have.property('fields');
          res.body.fields.should.be.eql(run.fields);
        }
        done();
      });
  });
}

function success(method, run, data) {
  it(run.it, (done) => {
    const request = prepareRequest(method, run, data);

    request.send(run.data)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');

        if(typeof run.callback === 'function') run.callback.call(this, err, res);
        done();
      });
  });
}

function prepareRequest(method, run, data) {
  run.url = run.url.replace(':id',data.uid);
  const request = chai.request(server)[method](run.url);

  if (typeof run.headers !== 'undefined') {
    run.headers.forEach(header => {request.set(header.name, header.value);});
  }
  if(run.authorization === true) {
    request.set('Authorization', 'Bearer ' + data.token);
  }
  return request;
}
