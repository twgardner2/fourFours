// foodController - add new

const express = require('express'),
      app = module.exports = express(),
      router = require('./routes/index.js'),

      // Packages
      layouts = require('express-ejs-layouts'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      expressValidator = require('express-validator'),
      mongoose = require('mongoose'),
      // Models
      Food = require('./models/food.js');


// mongoose
/// Use native promises
mongoose.Promise = global.Promise;
/// Connect to database
mongoose.connect('mongodb://localhost/pantry_db');
const db = mongoose.connection;
db.once('open', () => {
  console.log('Successfully connected to MongoDB, using pantry_db');
});


app.set('port', process.env.PORT || 3000);
app.set('token', process.env.TOKEN || 'recipeT0k3n');
app.set('view engine', 'ejs');

app.use(layouts);

app.use(methodOverride('_method', {
  methods: ['POST', 'GET']
}));

app.use( express.static( 'public' ) );


app.use(bodyParser.urlencoded( { extended: false } ));
app.use(bodyParser.json());
app.use(expressValidator());

app.use('/', router);

const server = app.listen(app.get('port'), () => {
  console.log(`Server running at http://localhost:${app.get('port')}`);
});
