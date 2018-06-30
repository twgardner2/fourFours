const router = require('express').Router(),
      homeController = require('../controllers/homeController.js');


router.get('/', homeController.viewHomePage);
router.get('/dragable', homeController.dragable);

module.exports = router;
