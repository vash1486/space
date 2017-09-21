module.exports = (app) => {
  app.use('/api', require('./routes/api/login'));
  app.use('/api/account', require('./routes/api/account'));
  app.use('/api/character', require('./routes/api/character'));
};
