var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

var app = express();
app.set('view engine', 'ejs');
app.set('views', './app/views');

app.use(express.static('./app/public'));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(fileUpload());

consign()
  .include('app/routes')
  .then('config/dbConnection.js')
  .then('app/models')
  .then('app/controllers')
  .into(app);

module.exports = app;
