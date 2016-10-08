//This file constains the DB schema  for the Health App
var Schema = {
  users: {
    id: {type: 'string', maxlength: 254, nullable: false, primary: true},
    username: {type: 'string', maxlength: 254, nullable: false, unique: true},
    role: {type: 'string', maxlength: 10, nullable: false},
    password: {type: 'string', maxlength: 150, nullable: false},
    score: {type: 'int', nullable: false}
  },
  questions: {
    id: {type: 'string', maxlength: 254, nullable: false, primary: true},
    question: {type: 'string', maxlength: 500, nullable: false},
    sub_question: {type: 'string', maxlength: 500, nullable: true}
  },
  answers: {
    id: {type: 'string', maxlength: 254, nullable: false, primary: true},
    UserId: {type: 'string', maxlength: 254, nullable: false},
    QuestionId: {type: 'string', maxlength: 254, nullable: false},
    answer: {type: 'int', nullable: false},
    sub_answer: {type: 'string', maxlength: 150, nullable: false}
  }
};
module.exports = Schema;
