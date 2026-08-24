const configureRoutes = (app) => {
  app.use('/api/auth', require('./api/auth'));
  app.use('/api/users', require('./api/users'));
  app.use('/api/chips', require('./api/chips'));
  app.use('/api/images', require('./api/images'));
  app.use('/api/hub', require('./api/hub'));
  app.get('/', (_req, res) => {
    res.status(200).send('XsollaVerse API');
  });
};

module.exports = configureRoutes;
