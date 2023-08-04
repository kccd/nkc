const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.survey_get,
  POST: Operations.survey_post,
  PARAMETER: {
    GET: Operations.survey_single_get,
    POST: Operations.survey_single_post,
  },
};
