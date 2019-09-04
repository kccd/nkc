NKC.modules.SurveyEdit = function() {
  var self = this;
  var reg = /^(http|https):\/\//i;
  self.app = new Vue({
    el: "#moduleSurveyEdit",
    data: {
      user: "",
      survey: "",
      newSurvey: "",
      grades: [],
      roles: [],
      timeEnd: {
        year: "",
        month: "",
        day: "",
        hour: "",
        minute: ""
      },
      timeStart: {
        year: "",
        month: "",
        day: "",
        hour: "",
        minute: ""
      },
      error: ""
    },
    computed: {
      timeStartDay: function() {
        return NKC.methods.getDayCountByYearMonth(this.timeStart.year, this.timeStart.month);
      },
      timeEndDay: function() {
        return NKC.methods.getDayCountByYearMonth(this.timeEnd.year, this.timeEnd.month);
      },
      voteCount: function() {
        var arr = [];
        for(var i = 1; i <= this.survey.options.length; i++) {
          arr.push(i);
        }
        return arr;
      },
      formName: function() {
        return {
          vote: "发起投票",
          survey: "问卷调查",
          score: "评分"
        }[this.survey.type];
      }
    },
    mounted: function() {
      var this_ = this;
      this_.setTime();
      this_.newSurvey = {
        st: "",
        et: "",
        showResult: "all",
        disabled: false,
        reward: { rewardedCount: 0, rewardCount: 0, onceKcb: 0, status: false },
        permission:
        {
          visitor: false,
          voteUpCount: 0,
          postCount: 0,
          threadCount: 0,
          digestThreadCount: 0,
          registerTime: 0,
          minGradeId: 1,
          certsId: [ 'default' ]
        },
        description: '',
        options: [
          this.newOption()
        ],
        type: 'vote'
      };
      nkcAPI("/survey", "GET")
        .then(function(data) {
          this_.grades = data.grades;
          this_.roles = data.roles;
          this_.user = data.user;
        })
    },
    methods: {
      newAnswer: function() {
        return {
          content: "",
          links: [],
          links_: [],
          resourcesId: [],
          minScore: 0,
          maxScore: 0
        }
      },
      newOption: function() {
        return {
          content: "",
          answers: [
            this.newAnswer()
          ],
          links: [],
          links_: [],
          resourcesId: [],
          maxVoteCount: 1,
          minVoteCount: 1
        }
      },
      getVoteCount: function(o) {
        var count = (o.answers || []).length;
        var arr = [];
        for(var i = 1; i <= count; i++) {
          arr.push(i);
        }
        return arr;
      },
      getMinVoteCount: function(o) {
        var count = (o.answers || []).length;
        var arr = [];
        for(var i = 0; i <= count; i++) {
          arr.push(i);
        }
        return arr;
      },
      format: NKC.methods.format,
      toInt: function() {
        var survey = this.survey;
        survey.permission.registerTime = parseInt(survey.permission.registerTime);
        survey.permission.digestThreadCount = parseInt(survey.permission.digestThreadCount);
        survey.permission.threadCount = parseInt(survey.permission.threadCount);
        survey.permission.postCount = parseInt(survey.permission.postCount);
        survey.permission.voteCount = parseInt(survey.permission.voteCount);
        for(var i = 0; i < survey.options.length; i++) {
          var option = survey.options[i];
          option.maxScore = parseInt(option.maxScore);
          option.minScore = parseInt(option.minScore);
        }
        survey.reward.onceKcb = parseInt(survey.reward.onceKcb);
        survey.reward.rewardCount = parseInt(survey.reward.rewardCount);
      },
      modifyLinks: function(links, type) {
        var arr = [];
        for(var j = 0; j < links.length; j++) {
          var link = links[j];
          if(type === "str") {
            arr.push(link.link);
          } else {
            arr.push({
              index: j,
              link: link
            });
          }
        }
        return arr;
      },
      setTime: function(timeStart, timeEnd) {
        if(!timeStart) timeStart = new Date();
        if(!timeEnd) timeEnd = new Date(Date.now() + 24*60*60*1000);
        this.timeStart = {
          year: timeStart.getFullYear(),
          month: timeStart.getMonth() + 1,
          day: timeStart.getDate(),
          hour: timeStart.getHours(),
          minute: timeStart.getMinutes()
        };
        this.timeEnd = {
          year: timeEnd.getFullYear(),
          month: timeEnd.getMonth() + 1,
          day: timeEnd.getDate(),
          hour: timeEnd.getHours(),
          minute: timeEnd.getMinutes()
        };
      },
      addAnswer: function(o) {
        o.answers.push(this.newAnswer());
      },
      removeResourceId: function(o, index) {
        o.resourcesId.splice(index, 1)
      },
      visitUrl: function(url) {
        NKC.methods.visitUrl(url, true);
      },
      removeOption: function(index) {
        sweetQuestion("确定要删除该调查？")
          .then(function() {
            self.app.survey.options.splice(index, 1);
          })
      },
      removeLink: function(o, index) {
        o.links_.splice(index, 1);
      },
      checkHttp: function(link) {
        if(!reg.test(link.link)) {
          link.link = "http://" + link.link;
        }
      },
      addLink: function(o) {
        o.links_.push({
          index: o.links_.length,
          link: "http://"
        });
      },
      addResource: function(o) {
        if(!window.SelectResource) {
          if(NKC.modules.SelectResource) {
            window.SelectResource = new NKC.modules.SelectResource();
          } else {
            return sweetError("未引入资源附件模块");
          }
        }
        SelectResource.open(function(data) {
          var resourcesId = data.resourcesId;
          for(var i = 0; i < resourcesId.length; i++) {
            var id = resourcesId[i];
            if(o.resourcesId.indexOf(id) === -1) o.resourcesId.push(id);
          }
        }, {
          allowedExt: ["picture"]
        });
      },
      addOption: function() {
        this.survey.options.push(this.newOption());
      },
      moveOption: function(type, o, answer) {
        var options, index;
        if(answer !== undefined) {
          options = o.answers;
          index = options.indexOf(answer);
        } else {
          options = this.survey.options;
          index = options.indexOf(o);
        }
        var other;
        var otherIndex;
        if(type === "up") {
          if(index === 0) return;
          otherIndex = index - 1;
        } else {
          if(index+1 === options.length) return;
          otherIndex = index + 1;
        }
        other = options[otherIndex];
        options[index] = other;
        if(answer !== undefined) {
          options[otherIndex] = answer;
          Vue.set(options, otherIndex ,answer);
        } else {
          options[otherIndex] = o;
          Vue.set(options, otherIndex ,o);
        }
      },
      removeAnswer: function(o, index) {
        sweetQuestion("确定要移除该选项？")
          .then(function() {
            o.answers.splice(index, 1);
          })

      },
      selectType: function(type) {
        this.survey.type = type;
        if(type === "vote" && (!this.survey.options || !this.survey.options.length)) {
          this.survey.options = [this.newOption()];
        }
      },
      te: function(err) {
        // this.error = err.error || err;
        throw err;
      },
      submit: function() {
        this.error = "";
        var te = this.te;
        var survey = this.survey;
        var this_ = this;
        if(survey.type !== "vote" && !survey.description) return te("请输入调查说明");
        if(!survey.options || !survey.options.length) return te("请至少添加一个选项");
        for(var i = 0; i < survey.options.length; i++) {
          var option = survey.options[i];
          if(!option.content) return te("请输入选项内容");
          option.links = this_.modifyLinks(option.links_, "str");
          if(!option.answers || !option.answers.length) return te("请为每个调查至少添加一个选项");
          for(var j = 0; j < option.answers.length; j++) {
            var answer = option.answers[j];
            if(!answer.content) return te("请输入选项内容");
            if(survey.type === "score") {
              if(answer.minScore < 1) return te("最小分值不能小于1");
              if(answer.maxScore <= answer.minScore) return te("最大分值必须大于最小分值");
            }
            answer.links = this_.modifyLinks(answer.links_, "str");
          }
          if(!option.maxVoteCount) return te("最大选择数量不能小于1");
          if(option.minVoteCount < 0) return te("最小选择数量不能小于0");
          if(option.maxVoteCount > option.answers.length) return te("最大选择数量不能超过选项数量");
          if(option.minVoteCount > option.maxVoteCount) return te("最小选择数量不能超过最大选择数量");
        }
        var timeEnd = this.timeEnd;
        var timeStart = this.timeStart;
        var st = new Date(
          timeStart.year + "-" + timeStart.month + "-" + timeStart.day +
          " " + timeStart.hour + ":" + timeStart.minute
        );
        var et = new Date(
          timeEnd.year + "-" + timeEnd.month + "-" + timeEnd.day +
          " " + timeEnd.hour + ":" + timeEnd.minute
        );
        survey.st = st;
        survey.et = et;
        console.log(survey);
        return survey;
        /*nkcAPI("/survey", "POST", {survey: survey})
          .then(function(data) {
            sweetSuccess("提交成功");
          })
          .catch(function(data) {
            sweetError(data);
          })*/
      }
    }
  });
  self.init = function(options) {
    options = options || {};
    if(options.pid) self.app.newSurvey.pid = options.pid;
    if(options.surveyId) {
      nkcAPI("/survey/" + options.surveyId, "GET")
        .then(function(data) {
          for(var i = 0; i < data.survey.options.length; i++) {
            var option = data.survey.options[i];
            option.links_ = self.app.modifyLinks(option.links);
            if(option.answers && option.answers.length) {
              for(var j = 0; j < option.answers.length; j++) {
                var answer = option.answers[j];
                answer.links_ = self.app.modifyLinks(answer.links);
              }
            }
          }
          self.app.survey = data.survey;
          self.app.setTime(new Date(self.app.survey.st), new Date(self.app.survey.et));
        })
        .catch(function(data) {
          sweetError(data);
        })
    } else {
      self.app.survey = self.app.newSurvey;
    }
  };
  self.getSurveyData = function() {
    return {
      ps: self.app.ps,
      options: self.app.ps
    };
  };
  self.getSurvey = function() {
    return self.app.submit();
  }
};