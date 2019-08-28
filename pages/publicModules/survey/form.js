NKC.modules.SurveyForm = function() {
  var self = this;
  self.app = new Vue({
    el: "#moduleSurveyForm",
    data: {
      loading: true,
      survey: ""
    },
    computed: {
      formName: function() {
        return {
          vote: "投票",
          survey: "问卷调查",
          score: "评分"
        }[this.survey.type];
      }
    },
    mounted: function() {

    }
  });
  self.init = function(options) {
    var app = self.app;
    nkcAPI("/survey/" + options.surveyId, "GET")
      .then(function(data) {
        app.survey = data.survey;
        app.loading = false;
      })
  }
};