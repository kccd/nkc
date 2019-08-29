NKC.modules.SurveyEdit = function() {
  var self = this;
  var reg = /^(http|https):\/\//i;
  self.app = new Vue({
    el: "#moduleSurveyEdit",
    data: {
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
        disabled: false,
        reward: { rewardedCount: 0, rewardCount: 0, onceKcb: 0, status: false },
        permission:
        { voteUpCount: 0,
          postCount: 0,
          threadCount: 0,
          digestThreadCount: 0,
          registerTime: 0,
          minGradeId: 1,
          certsId: [ 'default' ]
        },
        description: '',
        options: [],
        voteCount: '1',
        type: 'vote'
      };
      nkcAPI("/survey", "GET")
        .then(function(data) {
          this_.grades = data.grades;
          this_.roles = data.roles;
        })
    },
    methods: {
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
        for(var j = 0; j < links.length; j++) {
          var link = links[j];
          if(type === "str") {
            links[j] = link.link;
          } else {
            links[j] = {
              index: j,
              link: link
            };
          }

        }
      },
      setTime: function(timeStart, timeEnd) {
        if(!timeStart) timeStart = new Date();
        if(!timeEnd) timeEnd = new Date();
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
        o.answers.push({
          content: "",
          links: [],
          resourcesId: []
        });
      },
      removeResourceId: function(o, index) {
        o.resourcesId.splice(index, 1)
      },
      visitUrl: function(url) {
        NKC.methods.visitUrl(url, true);
      },
      removeOption: function(index) {
        sweetQuestion("确定要删除该选项？")
          .then(function() {
            self.app.survey.options.splice(index, 1);
          })
      },
      removeLink: function(o, index) {
        o.links.splice(index, 1);
      },
      checkHttp: function(link) {
        if(!reg.test(link.link)) {
          link.link = "http://" + link.link;
        }
      },
      addLink: function(o) {
        o.links.push({
          index: o.links.length,
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
        this.survey.options.push({
          content: "",
          minScore: 0,
          maxScore: 0,
          answers: [],
          description: "",
          links: [],
          resourcesId: []
        });
      },
      moveOption: function(type, o) {
        var options = this.survey.options;
        var index = options.indexOf(o);
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
        Vue.set(options, index, other);
        Vue.set(options, otherIndex, o);
      },
      removeAnswer: function(o, index) {
        o.answers.splice(index, 1);
      },
      selectType: function(type) {
        this.survey.type = type;
      },
      te: function(err) {
        // this.error = err.error || err;
        sweetError(err);
      },
      submit: function() {
        this.error = "";
        var te = this.te;
        var survey = this.survey;
        var this_ = this;
        if(!survey.description) return te("请输入说明");
        if(!survey.options || !survey.options.length) return te("请至少添加一个选项");
        for(var i = 0; i < survey.options.length; i++) {
          var option = survey.options[i];
          if(!option.content) return te("请输入选项内容");
          this_.modifyLinks(option.links, "str");
          if(survey.type === "survey" && (!option.answers || !option.answers.length)) return te("请为每个选项至少添加一个答案");
          if(survey.type === "score") {
            if(option.minScore < 1) return te("最小分值不能小于1");
            if(option.maxScore <= option.minScore) return te("最大分值必须大于最小分值");
          }
          for(var j = 0; j < option.answers.length; j++) {
            var answer = option.answers[j];
            if(!answer.content) return te("请输入答案内容");
            this_.modifyLinks(answer.links, "str");
          }
        }
        if(survey.type === "vote") {
          if(!survey.voteCount) return te("请设置最大可选择选项的数目");
          if(!survey.voteCount > survey.options.length) return te("最大可选择数目不能超过选项数目");
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
            self.app.modifyLinks(option.links);
            if(option.answers && option.answers.length) {
              for(var j = 0; j < option.answers.length; j++) {
                var answer = option.answers[j];
                self.app.modifyLinks(answer.links);
              }
            }
          }
          self.setTime(new Date(self.app.survey.st), new Date(self.app.survey.et));
          self.app.survey = data.survey;
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