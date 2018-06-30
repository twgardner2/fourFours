const router = require('express').Router(),
      homeRoutes = require('./homeRoutes.js'),
      foodRoutes = require('./foodRoutes.js');

router.use('/food', foodRoutes)
      .use('/', homeRoutes);

module.exports = router;
