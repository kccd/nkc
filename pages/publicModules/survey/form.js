NKC.modules.SurveyForm = function(id) {
  var self = this;
  id = id || "#moduleSurveyForm";
  var surveyId = $(id).attr("data-survey-id");
  self.app = new Vue({
    el: id,
    data: {
      loading: true,
      survey: "",
      havePermission: false,
      posted: false,
      options: [], // vote: optionsId, score: {score: 2}, survey: {answer: id}
      status: "", // unStart, beginning, end;
      surveyPost: ""
    },
    computed: {
      formName: function() {
        return {
          vote: "投票",
          survey: "问卷调查",
          score: "评分"
        }[this.survey.type];
      },
      startTime: function() {
        if(!this.survey) return "";
        return this.format("YYYY/MM/DD HH:mm:ss", this.survey.st);
      },
      endTime: function() {
        if(!this.survey) return "";
        return this.format("YYYY/MM/DD HH:mm:ss", this.survey.et);
      },
      postTime: function() {
        if(!this.posted || !this.surveyPost || !this.surveyPost.toc) return "";
        return this.format("YYYY/MM/DD HH:mm:ss", this.surveyPost.toc);
      }
    },
    methods: {
      format: NKC.methods.format,
      checkTime: function() {
        var survey = this.survey;
        var this_ = this;
        if(survey) {
          var et = new Date(survey.et).getTime();
          var st = new Date(survey.st).getTime();
          var now = Date.now();
          if(now < st) {
            this_.status = "unStart";
          } else if(now < et) {
            this_.status = "beginning";
          } else {
            this_.status = "end";
          }
        }
        setTimeout(function() {
          this_.checkTime();
        }, 1000);
      },
      getIndex: function(index) {
        return ["a", "b", "c", "d"][index];
      },
      submit: function() {
        var this_ = this;
        var survey = this.survey;
        var options = this.options;
        var type = survey.type;
        // 投票
        nkcAPI("/survey/" + survey._id, "POST", {
          options: options
        })
          .then(function(data) {
            this_.surveyPost = data.surveyPost;
            this_.posted = true;
          })
          .catch(function(data) {
            sweetError(data);
          });
      },
      // 针对投票，选择选项
      selectOption: function(index) {
        if(!this.havePermission) return;
        if(this.status !== "beginning" || this.posted) return;
        var options = this.options;
        var survey = this.survey;
        var o = survey.options[index];
        var i = options.indexOf(o._id);
        if(i !== -1) {
          options.splice(i, 1);
        } else {
          if(options.length >= survey.voteCount) {
            // 如果是单选，则勾选其他时取消已选
            if(survey.voteCount === 1) {
              options.splice(0, 9999999);
            } else {
              return;
            }
          }
          options.push(o._id);
        }
      },
      visitUrl: function(url){
        NKC.methods.visitUrl(url, true);
      },
      getSurveyById: function(id) {
        var app = this;
        nkcAPI("/survey/" + id, "GET")
          .then(function(data) {
            var options = [];
            if(data.surveyPost) {
              app.surveyPost = data.surveyPost;
              options = data.surveyPost.options;
              app.posted = true;
            } else {
              var type = data.survey.type;
              for(var i = 0; i < data.survey.options.length; i++) {
                var o = data.survey.options[i];
                o.scores = [];
                for(var j = o.minScore; j <= o.maxScore; j++) {
                  o.scores.push(j);
                }
                if(type === "score") {
                  options.push({
                    score: 0
                  });
                } else if(type === "survey") {
                  options.push({
                    answer: ""
                  });
                }
              }
            }
            app.havePermission = data.havePermission;
            app.options = options;
            app.survey = data.survey;
            app.loading = false;
          })
      }
    },
    mounted: function() {
      if(surveyId) {
        this.getSurveyById(surveyId);
      }
      this.checkTime();
    }
  });
  self.init = function(options) {
    options = options || {};
    if(options.surveyId) {
      self.app.getSurveyById(options.surveyId);
    }
  }
};