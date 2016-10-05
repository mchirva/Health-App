//This file constains the server code for the Health App
var _ = require('lodash');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// application routing
var router = express.Router();

// body-parser middleware for handling request variables
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


var User = Bookshelf.Model.extend({
    tableName: 'users'
});

var Question = Bookshelf.Model.extend({
  tableName: 'questions'
});

var Answer = Bookshelf.Model.extend({
  tableName: 'answers',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User, "user_id");
  },
  question: function() {
    return this.belongsTo(Question, 'question_id');
  }
});

var Users = Bookshelf.Collection.extend({
  model: User
});

var Questions = Bookshelf.Collection.extend({
  model: Question
});

var Answers = Bookshelf.Collection.extend({
  model: Answer
});

router.route('/users')
//Fecth all users
.get(function (req, res) {
    Users.forge()
    .fetch()
    .then(function (collection) {
      res.json({error: false, data: collection.toJSON()});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })

  app.use('/api', router);
  app.listen(8080, function() {
    console.log("✔ Express server listening on port %d in %s mode", 8080, app.get('env'));
  });
