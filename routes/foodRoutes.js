const router = require('express').Router(),
      homeController = require('../controllers/homeController.js')
      foodController = require('../controllers/foodController.js');

       // Index
router.get('/', foodController.fetchIndex, foodController.viewIndex)
      .get('/indexAgg', foodController.fetchAggIndex, foodController.viewAggIndex)
       // New Items
      .get('/new', foodController.formAddNewFood)
      .post('/new', foodController.addNewFood, homeController.redirect)
      // View Items
      .get('/:id/view', foodController.viewFood)
      // Edit Items
      .get('/:id/edit', foodController.formEditFoodPopulate)
      .put('/:id/edit', foodController.editFoodExecute, homeController.redirect)
      // Delete Items
      .delete('/:id/delete', foodController.deleteFood, homeController.redirect);

module.exports = router;
