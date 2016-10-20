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

// Twilio Credentials
var accountSid = 'ACfeca013d7fa17c1219e9639ad20e52ed';
var authToken = '8e06c49dca78a3ea4336150629661f8f';

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

var Bookshelf = require('bookshelf')(knex);
var generator = require('generate-password');
var lodash_ = require('lodash');
var uuid = require('uuid');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt    = require('jsonwebtoken');
var shortid = require("shortid");
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
<<<<<<< HEAD
.post(function (req, res) {
  var decoded = jwt.verify(req.body.token, JWTKEY);
  if(decoded){
=======
    .post(function (req, res) {
        var decoded = jwt.verify(req.body.token, JWTKEY);
        if(decoded){
>>>>>>> bb0ca692f1a996920592ab0808257d045c44c40c
        knex.from('users')
            .where('role', 'Patient')
            .then(function (collection) {
                res.json({error: false, data: collection});
            })
            .catch(function (err) {
                res.status(500).json({error: true, data: {message: err.message}});
            });
          }else {
            res.json({error: true, data: {message: 'invalid token'}});
          }
  });

router.route('/createUser')
    .post(function (req, res) {
      var decoded = jwt.verify(req.body.token, JWTKEY);
      if(decoded) {
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
      }else {
        res.json({error: true, data: {message: 'invalid token'}});
      }

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
          expiresIn: 1800 //The token expries in 30 minutes
        });
        res.json({error: false, data: {user: user.toJSON(), token: token}});
      }
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
    });
  });

router.route('/saveResponse')
    .post(function (req, res) {
        var decoded = jwt.verify(req.body.token, JWTKEY);
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
    .post(function (req, res) {
        var decoded = jwt.verify(req.body.token, JWTKEY);
        if(decoded) {
          knex.from('answers')
              .where('UserId',req.params.userId)
              .orderBy('questionId','ASC')
              .then(function (answers) {
                  var medicationSum = 0;
                  var dietSum = 0;
                  var paSum = 0;
                  var smokingSum = 0;
                  var wmSum = 0;
                  var alcoholProduct = 0;
                  var offset = 0;
                  console.log(answers);
                  if(answers[0].QuestionId == 1){
                      console.log('Entered');
                      offset = 3
                      for(var i=0;i<3;i++){
                          medicationSum = medicationSum + answers[i].Answer;
                      }
                  }
                  for(var i=offset;i<offset+11;i++){
                      dietSum = dietSum + answers[i].Answer;
                  }
                  for(var i=offset+11;i<offset+13;i++){
                      paSum = paSum + answers[i].Answer;
                  }
                  for(var i=offset+15;i<offset+17;i++){
                      smokingSum = smokingSum + answers[i].Answer;
                  }
                  for(var i=offset+17;i<offset+27;i++){
                      wmSum = wmSum + answers[i].Answer;
                  }
                  alcoholProduct = answers[offset+27].Answer * answers[offset+28].Answer

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
        }else {
          res.json({error: true, data: {message: 'invalid token'}});
        }

    });

router.route('/getResult/:userId')
    .post(function (req, res) {
      var decoded = jwt.verify(req.body.token, JWTKEY);
      if(decoded) {
        knex.from('answers').innerJoin('questions', 'answers.QuestionId', 'questions.QuestionId')
            .where('UserId',req.params.userId)
            .then(function(questionsAnswers) {
                res.json(questionsAnswers);
            })
            .catch(function (err){
                res.status(500).json({error: true, data: {message: err.message}});
        })
      }else {
        res.json({error: true, data: {message: 'invalid token'}});
      }
    });

router.route('/registerUser')
    .post(function (req, res) {
        var password = generator.generate({
            length: 8,
            numbers: true,
            symbols: true,
            uppercase: true
        });
        var username = shortid.generate();
        User.forge({
            id: uuid.v1(),
            name: req.body.name,
            gender: req.body.gender,
            phone: req.body.phone,
            username: username,
            password: password
        }).save(null, {method: 'insert'})
            .then(function (user) {
                client.messages.create({
                    to: req.body.phone,
                    from: '+19842046452',
                    body: 'Your UserId is:'+username+' and password is:'+password,
                }, function (err, message) {
                    console.log(message.sid);
                });
                res.json({error: false, data: {id: user.get('id')}});
            })
            .catch(function (err) {
                res.status(500).json({error: true, data: {message: err.message}});
            });
    });

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin',"*");

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "*");

    res.setHeader('Access-Control-Expose-Headers','*');

    // Pass to next layer of middleware
    next();
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.use('/api', router);

  app.listen(8080, function() {
    console.log("✔ Express server listening on port %d in %s mode", 8080, app.get('env'));
  });
