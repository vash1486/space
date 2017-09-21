// http://mongoosejs.com/docs/connections.html
const mongoose = require('mongoose');
const bluebird = require('bluebird');

let options = {
    db: {
        native_parser: true
    },
    server: {
        poolSize: 5,
        keepAlive: 120
    },
    promiseLibrary: bluebird
    //  replset: { rs_name: 'myReplicaSetName' },
    //  user: 'spacedb',
    //  pass: 'spacepass'
};

mongoose.Promise = bluebird;
mongoose.connect('mongodb://localhost/space', options);
