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

      type: "", // vote, survey, score

    },
    methods: {
      selectType: function(type) {
        this.type = type;
      },
      complete: function() {

      }
    }
  });
  self.open = function(callback, options) {
    self.dom.modal("show");
  };
  self.close = function() {
    self.dom.modal("hide");
  }
};