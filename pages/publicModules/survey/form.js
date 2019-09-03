NKC.modules.SurveyForm = function(id) {
  var self = this;
  id = id || "#moduleSurveyForm";
  var surveyId = $(id).attr("data-survey-id");
  self.app = new Vue({
    el: id,
    data: {
      loading: true,
      survey: "",
      showResult: false,
      havePermission: false,
      posted: false,
      options: [], // vote: optionsId, score: {score: 2}, survey: {answer: id}
      status: "", // unStart, beginning, end;
      surveyPost: "",
      users: []
    },
    computed: {
      // 投票结果总结
      postResult: function() {
        if(!this.showResult) return;
        var survey = this.survey;
        if(survey.type !== 'score') {
          return "参与人数：" + survey.postCount;
        } else {
          return "参与人数：" + survey.postCount;
        }
      },
      timeInfo: function() {
        var status = this.status;
        if(status === "unStart") return "调查将于 " + this.startTime + " 开始，"+this.endTime+" 结束。";
        else if(status === "beginning") return "调查将于 "+this.endTime+" 结束。";
        else if(status === "end") return "调查已结束。";
        else return ""
      },
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
      },
      answerScore: function() {
        var survey = this.survey;
        var postOption = this.options;
        if(survey.type !== "score") return;
        var score = 0, count = 0, postScore = 0;
        for(var i = 0; i < survey.options.length; i++) {
          var option = survey.options[i];
          for(var j = 0; j < option.answers.length; j++) {
            var answer = option.answers[j];
            score += answer.maxScore;
            postScore += postOption[i].answers[j].score;
            count++;
          }
        }
        return {
          score: score,
          postScore: postScore,
          count: count
        };
      },
      totalScore: function() {
        var score = this.answerScore;
        if(score === undefined) return;
        return score.score;
      },
      answerCount: function() {
        var count = this.answerScore;
        if(count === undefined) return;
        return count.count;
      },
      postScore: function() {
        var postScore = this.answerScore;
        if(postScore === undefined) return;
        return postScore.postScore;
      }
    },
    methods: {
      format: NKC.methods.format,
      getColor: NKC.methods.getRandomColor,
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
            sweetSuccess("提交成功");
            this_.getSurveyById(survey._id);
          })
          .catch(function(data) {
            sweetError(data);
          });
      },
      // 针对投票，选择选项
      selectOption: function(index, aIndex) {
        if(!this.havePermission) return;
        if(this.status !== "beginning" || this.posted) return;
        var options = this.options;
        var survey = this.survey;
        var a = survey.options[index].answers[aIndex];
        var selected = options[index].answers[aIndex].selected;
        if(selected) {
          options[index].answers[aIndex].selected = false;
        } else {
          var selectedCount = 0;
          for(var i = 0; i < options[index].answers.length; i++) {
            if(options[index].answers[i].selected) selectedCount ++;
          }
          if(selectedCount >= survey.options[index].voteCount) {
            // 如果是单选，则勾选其他时取消已选
            if(survey.options[index].voteCount === 1) {
              for(var i = 0; i < options[index].length; i++) {
                options[index].answers[i].selected = false;
              }
            } else {
              return;
            }
          }
          options[index].answers[aIndex].selected = true;
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
            app.showResult = data.showResult;
            app.users = data.users;
            if(data.surveyPost) {
              app.surveyPost = data.surveyPost;
              options = data.surveyPost.options;
              app.posted = true;
            } else {
              for(var i = 0; i < data.survey.options.length; i++) {
                var o = data.survey.options[i];
                var answers_ = [];
                for(var j = 0; j < o.answers.length; j++) {
                  var answer = o.answers[j];
                  answer.scores = [];
                  for(var n = answer.minScore ||0; n <= answer.maxScore||0; n++) {
                    answer.scores.push(n);
                  }
                  answers_.push({
                    _id: answer._id,
                    score: 0,
                    selected: false
                  });
                }
                options.push({
                  _id: o._id,
                  answers: answers_
                });
              }
            }
            app.havePermission = data.havePermission;
            app.options = options;
            if(app.showResult) {
              for(var i = 0; i < data.survey.options.length; i++) {
                var option = data.survey.options[i];
                for(var j = 0; j < option.answers.length; j++) {
                  var answer = option.answers[j];
                  answer.color = app.getColor();
                  answer.progress = data.survey.postCount === 0? 0: ((answer.postCount || 0)*100/(data.survey.postCount || 0)).toFixed(1);
                  answer.average = data.survey.postCount === 0? 0: ((answer.postScore || 0)/(data.survey.postCount||0)).toFixed(2);
                }
              }
            }
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