//This file constains the DB schema  for the Health App
var Schema = {
  users: {
    id: {type: 'increments', nullable: false, primary: true},
    username: {type: 'string', maxlength: 254, nullable: false, unique: true},
    role: {type: 'string', maxlength: 5, nullable: false},
    password: {type: 'string', maxlength: 150, nullable: false}
  },
  questions: {
    id: {type: 'increments', nullable: false, primary: true},
    question: {type: 'string', maxlength: 500, nullable: false},
    sub_question: {type: 'string', maxlength: 500, nullable: true}
  },
  answers: {
    id: {type: 'increments', nullable: false, primary: true},
    answer: {type: 'string', maxlength: 150, nullable: false},
    sub_answer: {type: 'string', maxlength: 150, nullable: false},
    created_at: {type: 'dateTime', nullable: false}
  },
  user_responses: {
    answer_id: {type: 'integer', nullable: false, unsigned: true},
    user_id: {type: 'integer', nullable: false, unsigned: true},
    question_id: {type: 'integer', nullable: false, unsigned: true},
  }
};
module.exports = Schema;
