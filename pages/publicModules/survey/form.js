NKC.modules.SurveyForm = function(id) {
  var self = this;
  id = id || "#moduleSurveyForm";
  var surveyId = $(id).attr("data-survey-id");
  self.app = new Vue({
    el: id,
    data: {
      loading: true,
      survey: "",
      targetUser: "",
      showResult: false,
      havePermission: false,
      posted: false,
      options: [], // vote: optionsId, score: {score: 2}, survey: {answer: id}
      status: "", // unStart, beginning, end;
      surveyPost: "",
      errorInfo: {},
      users: []
    },
    computed: {
      // 奖励状态
      rewardInfo: function() {
        var reward = this.survey.reward;
        var kcb = this.targetUser.kcb;
        if(!reward.status) return;
        if(reward.rewardedCount >= reward.rewardCount) return;
        if(kcb/100 < reward.onceKcb) return;
        return "作者设定每次提交奖励"+reward.onceKcb/100+"个科创币，数量有限，发完即止。";
      },
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
        if(status === "unStart") return "开始时间：" + this.startTime + " ，结束时间："+this.endTime;
        else if(status === "beginning") return "结束时间："+this.endTime;
        else if(status === "end") return "已结束。";
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
      // 修改投票结果
      modifyPost: function() {
        if(this.status === "end") return;
        this.posted = false;
      },
      selectCount: function(o) {
        var minVoteCount = o.minVoteCount;
        var maxVoteCount = o.maxVoteCount;
        if(minVoteCount === maxVoteCount) {
          return (minVoteCount === 1)? "单项选择": "必选数量：" + minVoteCount;
        } else {
          return "勾选数量必须>=" + minVoteCount + "且<=" + maxVoteCount;
        }
      },
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
        this.errorInfo = {};
        // 检测打分范围是否符合要求
        if(survey.type === "score") {
          for(var i = 0; i < survey.options.length; i++) {
            var o = survey.options[i];
            for(var j = 0; j < o.answers.length; j ++) {
              var a = o.answers[j];
              var so = this.getOptionById(o._id, a._id);
              var maxScore = a.maxScore;
              var minScore = a.minScore;
              if(
                so.score === "" ||
                so.score < minScore ||
                so.score > maxScore
              ) {
                this.errorInfo[o._id + "_" + a._id] = true;
                window.location.href = "#" + o._id + "_" + a._id;
                return sweetError("打分分值不在规定的范围内，请检查");
              }
            }
          }
        }

        // 投票
        nkcAPI("/survey/" + survey._id, "POST", {
          options: options,
          type: this.surveyPost? "modifyPost": "newPost"
        })
          .then(function(data) {
            if(data.rewardNum !== undefined) {
              sweetSuccess("提交成功！获得" + data.rewardNum/100 + "个科创币。", {autoHide: false});
            } else {
              sweetSuccess("提交成功");
            }
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
            app.targetUser = data.targetUser;
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
                var postScore = 0;
                var maxProgress;
                for(var j = 0; j < option.answers.length; j++) {
                  var answer = option.answers[j];
                  postScore += answer.postScore || 0;
                  answer.color = app.getColor();
                  answer.progress = data.survey.postCount === 0? 0: ((answer.postCount || 0)*100/(data.survey.postCount || 0)).toFixed(1);
                  if(answer.progress && (!maxProgress || maxProgress < parseFloat(answer.progress))) maxProgress = answer.progress;
                  answer.average = data.survey.postCount === 0? 0: ((answer.postScore || 0)/(data.survey.postCount||0)).toFixed(2);
                }
                option.postScore = postScore;
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