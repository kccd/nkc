NKC.modules.PostSurveyEdit = function() {
  var self = this;
  self.dom = $("#modulePostSurveyEdit");
  self.dom.modal({
    show: false,
    backdrop: "static"
  });
  self.app = new Vue({
    el: "#modulePostSurveyEditApp",
    data: {
      canClickButton: false,
      ps: ""
    },
    methods: {
      newSurvey: function() {
        this.ps = JSON.parse(JSON.stringify({
          type: "vote",  // vote, survey, score
          description: ""
        }));
      },
      selectType: function(type) {
        this.ps.type = type;
      },
      complete: function() {

      }
    }
  });
  self.open = function(callback, options) {
    options = options || {};
    if(options.psId) {
      nkcAPI("/survey/" + options.psId, "GET")
        .then(function(data) {
          self.app.ps = data.survey;
        })
        .catch(function(data) {
          sweetError(data);
        })
    } else {
      self.app.newSurvey();
    }
    self.dom.modal("show");
  };
  self.close = function() {
    self.dom.modal("hide");
  }
};