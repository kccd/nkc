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
      // 已选结果
      optionsObj: function() {
        var obj = {};
        var options = this.options;
        for(var i = 0; i < options.length; i++) {
          var option = options[i];
          if(option && option.answerId && option.optionId) {
            obj[option.optionId + "-" + option.answerId] = option
          }
        }
        return obj;
      },
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
      resetSelectedAnswerById: function(optionId) {
        for(var i = 0; i < this.options.length; i++) {
          var option = this.options[i];
          if(option.optionId === optionId) option.selected = false;
        }
      },
      getSelectedAnswerCountById: function(optionId) {
        var count = 0;
        for(var i = 0; i < this.options.length; i++) {
          var option = this.options[i];
          if(option.optionId === optionId && option.selected) count++;
        }
        return count;
      },
      getOptionById: function(optionId, answerId) {
        for(var i = 0; i < this.options.length; i++) {
          var option = this.options[i];
          if(option.optionId === optionId && option.answerId === answerId) return option;
        }
      },
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
        var option = survey.options[index];
        var answer = option.answers[aIndex];
        var selectedOption = this.getOptionById(option._id, answer._id);
        var selected = selectedOption && selectedOption.selected;
        if(selected) {
          selectedOption.selected = false;
        } else {
          var selectedCount = this.getSelectedAnswerCountById(option._id);
          if(selectedCount >= survey.options[index].maxVoteCount) {
            // 如果是单选，则勾选其他时取消已选
            if(survey.options[index].maxVoteCount === 1) {
              this.resetSelectedAnswerById(option._id);
            } else {
              return;
            }
          }
          if(selectedOption) {
            selectedOption.selected = true;
          } else {
            options.push({
              score: "",
              selected: true,
              optionId: option._id,
              answerId: answer._id
            });
          }
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
                for(var j = 0; j < o.answers.length; j++) {
                  var answer = o.answers[j];
                  options.push({
                    optionId: o._id,
                    answerId: answer._id,
                    selected: false,
                    score: ""
                  });
                }
              }
            }
            app.havePermission = data.havePermission;
            app.options = options;
            if(app.showResult) {
              for(var i = 0; i < data.survey.options.length; i++) {
                var option = data.survey.options[i];
                var maxProgress;
                for(var j = 0; j < option.answers.length; j++) {
                  var answer = option.answers[j];
                  answer.color = app.getColor();
                  answer.progress = data.survey.postCount === 0? 0: ((answer.postCount || 0)*100/(data.survey.postCount || 0)).toFixed(1);
                  if(answer.progress && (!maxProgress || maxProgress < parseFloat(answer.progress))) maxProgress = answer.progress;
                  answer.average = data.survey.postCount === 0? 0: ((answer.postScore || 0)/(data.survey.postCount||0)).toFixed(2);
                }
                for(var j = 0; j < option.answers.length; j++) {
                  var answer = option.answers[j];
                  if(maxProgress) {
                    if(maxProgress === parseFloat(answer.progress)) {
                      answer.domProgress = 100;
                    } else {
                      answer.domProgress = 100 * parseFloat(answer.progress) / maxProgress;
                    }
                  } else {
                    answer.domProgress = answer.progress;
                  }
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