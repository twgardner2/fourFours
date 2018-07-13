const router = require('express').Router(),
      homeController = require('../controllers/homeController.js');


router.get('/', homeController.viewHomePage);
router.get('/dragable', homeController.dragable);
router.get('/dragTest', homeController.dragTest);
router.get('/newDrag', homeController.newDrag);

module.exports = router;
