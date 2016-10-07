//This file constains the server code for the Health App
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : 'localhost',
        user     : 'root',
        password : 'bazzinga',
        database : 'HealthApp',
        charset  : 'utf8'
  }
});

var Bookshelf = require('bookshelf')(knex);

var _ = require('lodash');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt    = require('jsonwebtoken');
var JWTKEY = 'FalconDecoder'; // Key for Json Web Token

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
  hasTimestamps: true
});

var UserResponse = Bookshelf.Model.extend({
  tableName: 'user_responses',
  user: function() {
    return this.belongsTo(User, "user_id");
  },
  question: function() {
    return this.belongsTo(Question, 'question_id');
  },
  answer: function() {
    return this.belongsTo(Answer, 'answer_id');
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

var UserResponses = Bookshelf.Collection.extend({
  model: UserResponse
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

  router.route('/login')
  .post(function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    User.forge({username: username, password: password})
    .fetch()
    .then(function (user){
      if (!user) {
        res.json({error: true, data: {message: "Inavlid user credentials"}});
      }else {
        var token = jswt.sign(user, JWTKEY, {
          expiresInMinutes: 30 //The token expries in 30 minutes
        });
        res.json({error: false, date: {user: user.toJSON(), token: token}});
      }
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  })

  app.use('/api', router);
  app.listen(8080, function() {
    console.log("✔ Express server listening on port %d in %s mode", 8080, app.get('env'));
  });
