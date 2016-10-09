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

var lodash_ = require('lodash');
var uuid = require('uuid');
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
    user: function() {
        return this.belongsTo(User, "UserId");
    },
    question: function() {
        return this.belongsTo(Question, "QuestionId");
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


router.route('/getPatients')
//Fecth all patients
.get(function (req, res) {
    knex.from('users')
    .where('role','Patient')
    .then(function (collection) {
      res.json({error: false, data: collection});
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });

router.route('/createUser')
    .post(function (req, res) {
        User.forge({
            id: uuid.v1(),
            name: req.body.name,
            gender: req.body.gender,
            username: req.body.username,
            password: req.body.password
            })
            .save(null, {method: 'insert'})
            .then(function (user) {
                res.json({error: false, data: {id: user.get('id')}});
            })
            .catch(function (err) {
                res.status(500).json({error: true, data: {message: err.message}});
            });
    });

router.route('/login')
  .post(function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    User.forge({username: username, password: password})
    .fetch()
    .then(function (user){
      if (!user) {
        res.json({error: true, data: {message: "Invalid user credentials"}});
      }else {
        var token = jwt.sign(user, JWTKEY, {
          expiresIn: 60 //The token expries in 30 minutes
        });
        res.json({error: false, date: {user: user.toJSON(), token: token}});
      }
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });

router.route('/saveResponse')
    .post(function (req, res) {
        var decoded = jwt.verify(req.body.token, JWTKEY);
        console.log(decoded);
        if(decoded) {
            Answer.forge({
                AnswerId: uuid.v1(),
                userId: req.body.userId,
                questionId: req.body.questionId,
                answer: req.body.answer,
                subQuestionAnswer: req.body.subQuestionAnswer
                })
                .save(null, {method: 'insert'})
                .then(function (answer) {
                    res.json({error: false, data: {id: answer.get('AnswerId')}});
                })
                .catch(function (err) {
                    res.status(500).json({error: true, data: {message: err.message}});
                });
        }
    });

router.route('/calculateScore/:userId')
    .get(function (req, res) {
        Answer.forge({userId: req.params.userId})
            .orderBy('questionId','ASC')
            .fetchAll()
            .then(function (answers) {
                var medicationSum = 0;
                var dietSum = 0;
                var paSum = 0;
                var smokingSum = 0;
                var wmSum = 0;
                var alcoholProduct = 0;
                for(var i=0;i<3;i++){
                    medicationSum = medicationSum + answers.models[i].attributes.Answer;
                }
                for(var i=3;i<14;i++){
                    dietSum = dietSum + answers.models[i].attributes.Answer;
                }
                for(var i=14;i<16;i++){
                    paSum = paSum + answers.models[i].attributes.Answer;
                }
                for(var i=18;i<20;i++){
                    smokingSum = smokingSum + answers.models[i].attributes.Answer;
                }
                for(var i=20;i<30;i++){
                    wmSum = wmSum + answers.models[i].attributes.Answer;
                }
                alcoholProduct = answers.models[30].attributes.Answer * answers.models[31].attributes.Answer

                res.json({medication: medicationSum,
                            diet: dietSum,
                            physicalActivity: paSum,
                            smoking: smokingSum,
                            weightManagement: wmSum,
                            alcohol: alcoholProduct});
            })
            .catch(function (err) {
                res.status(500).json({error: true, data: {message: err.message}});
            })
    });

router.route('/getResult/:userId')
    .get(function (req, res) {
        knex.from('answers').innerJoin('questions', 'answers.QuestionId', 'questions.QuestionId')
            .where('UserId',req.params.userId)
            .then(function(questionsAnswers) {
                res.json(questionsAnswers);
            })
            .catch(function (err){
                res.status(500).json({error: true, data: {message: err.message}});
        })
    });

  app.use('/api', router);
  app.listen(8080, function() {
    console.log("✔ Express server listening on port %d in %s mode", 8080, app.get('env'));
  });
