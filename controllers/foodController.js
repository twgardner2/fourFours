const Food = require('../models/food.js');

const getFoodParams = (body) => {
  return {
    item: body.item,
    quantity: body.quantity,
    expirationDate: body.expirationDate,
    storageLocation: body.storageLocation
  }
}

module.exports = {

  fetchIndex: (req, res, next) => {
    Food.find({})
        .then(food => {
          res.locals.food = food;
          //console.log(food);
          next();
        })
        .catch(error => {
          console.log(`Error fetching food: ${error.message}`);
          next(error);
        });
  },

  fetchAggIndex: (req, res, next) => {
    Food.aggregate([
      {$group: {
        _id: '$item',
        "quantity": {$sum: "$quantity"}
      }}
    ])
        .then(food => {
          res.locals.food = food;
          console.log(food);
          next();
        })
        .catch(error => {
          console.log(`Error fetching and aggregating food: ${error.message}`);
          next(error);
        });
  },

  viewIndex: (req, res) => {
    res.render('food/index.ejs');
  },

  viewAggIndex: (req, res) => {
    res.render('food/indexAgg.ejs');
  },

  formAddNewFood: (req, res) => {
    res.render('food/create.ejs');
  },

  addNewFood: (req, res, next) => {
    let foodParams = getFoodParams(req.body);

    Food.create(foodParams)
        .then(food => {
          console.log(`\nCreated food: ${food.item}`);
          res.locals.redirect = '/food';
          next();
        })
        .catch(error => {
          console.log(`Error creating food: ${error.message}`);
          next(error);
        });
  },

  viewFood: (req, res) => {
    let foodIdToView = req.params.id;
    Food.findOne({_id: foodIdToView})
        .exec()
        .then(food => {
          res.locals.food = food;
          res.render('food/view.ejs');
        })
        .catch(error => {
          console.log(`Error fetching food to view: ${error.message}`);
        });
  },

  formEditFoodPopulate: (req, res, next) => {
    let foodIdToEdit = req.params.id;
    // console.log(`req.params.id: ${req.params.id}`);
    // console.log(`foodIdToEdit: ${foodIdToEdit}`);
    Food.findOne({_id: foodIdToEdit})
        .exec()
        .then(food => {
          console.log(`\nFetched ${food.item} to edit`);
          res.locals.food = food;
          res.render('food/edit.ejs');
        })
        .catch(error => {
          console.log(`Error populating edit form: ${error.message}`);
        });
  },

  editFoodExecute: (req, res, next) => {
    let foodIdToEdit = req.params.id;
    let updatedFoodParams = getFoodParams(req.body);
    Food.findByIdAndUpdate( foodIdToEdit,
          {$set: updatedFoodParams}
        )
        .then(food => {
          console.log(`\nUpdated id ${food._id}: ${food.item}`);
          res.locals.redirect = '/food';
          next();
        })
        .catch(error => {
          console.log(`\nError updating food: ${error.message}`);
          next(error);
        });
  },

  deleteFood: (req, res, next) => {
    let foodIdToDelete = req.params.id;
    Food.findByIdAndRemove(foodIdToDelete, {select: 'item'})
        .then(food => {
          console.log(`Deleted food: ${food.item}`);
          res.locals.redirect = '/food';
          next();
        })
        .catch(error => {
          console.log(`Error deleting food: ${error.message}`);
          next(error);
        })
  }

}
