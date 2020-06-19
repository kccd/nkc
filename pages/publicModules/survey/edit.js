NKC.modules.SurveyEdit = function() {
  var self = this;
  var reg = /^(http|https):\/\//i;
  self.app = new Vue({
    el: "#moduleSurveyEdit",
    data: {
      disabled: true,
      deadlineMax: "",
      targetUser: "",
      survey: "",
      newSurvey: "",
      grades: [],
      roles: [],
      users: [],
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
      selectedUsers: function() {
        var uid = this.survey.permission.uid || [];
        var arr = [];
        for(var i = 0; i < uid.length; i++) {
          var u = this.getUserById(uid[i]);
          if(u) arr.push(u);
        }
        return arr;
      },
      rewardKcbTotal: function() {
        var survey = this.survey;
        if(survey.reward.onceKcb && survey.reward.rewardCount) {
          return (survey.reward.onceKcb*survey.reward.rewardCount).toFixed(2);
        }
      },
      rewardWarning: function() {
        var targetUser = this.targetUser;
        var survey = this.survey;
        if(targetUser.kcb/100 < survey.reward.onceKcb*survey.reward.rewardCount) {
          return "你的科创币不足，透支后将不再奖励。"
        }
      },
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
          gradesId: [1],
          certsId: [ 'default' ],
          uid: []
        },
        description: '',
        options: [
          this.newOption()
        ],
        type: 'vote'
      };
      nkcAPI("/survey?t=thread", "GET")
        .then(function(data) {
          this_.deadlineMax = data.deadlineMax;
          this_.grades = data.grades;
          var arr = [];
          for(var i = 0; i < data.grades.length; i++) {
            arr.push(data.grades[i]._id);
          }
          this_.newSurvey.permission.gradesId = arr;
          this_.roles = data.roles;
          this_.targetUser = data.user;
        })
    },
    methods: {
      checkNumber: NKC.methods.checkData.checkNumber,
      checkString: NKC.methods.checkData.checkString,
      getUrl: NKC.methods.tools.getUrl,
      removeUser: function(index) {
        this.survey.permission.uid.splice(index, 1);
      },
      getUserById: function(id) {
        var users = this.users;
        for(var i = 0; i < users.length; i++) {
          var u = users[i];
          if(u.uid === id) return u;
        }
      },
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
      // format: NKC.methods.format,
      toInt: function() {
        var survey = this.survey;
        survey.permission.registerTime = parseInt(survey.permission.registerTime);
        survey.permission.digestThreadCount = parseInt(survey.permission.digestThreadCount);
        survey.permission.threadCount = parseInt(survey.permission.threadCount);
        survey.permission.postCount = parseInt(survey.permission.postCount);
        survey.permission.voteCount = parseInt(survey.permission.voteCount);
        for(var i = 0; i < survey.options.length; i++) {
          var option = survey.options[i];
          for(var j = 0; j < option.answers.length; j++) {
            var answer = option.answers[j];
            answer.maxScore = parseFloat(answer.maxScore.toFixed(2));
            answer.minScore = parseFloat(answer.minScore.toFixed(2));
          }
        }
        survey.reward.onceKcb = parseFloat(survey.reward.onceKcb.toFixed(2));
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
        sweetQuestion("确定要删除该问题？")
          .then(function() {
            self.app.survey.options.splice(index, 1);
          }).catch(function(){})
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
      selectUser: function() {
        if(!window.SelectUser) {
          if(NKC.modules.SelectUser) {
            window.SelectUser = new NKC.modules.SelectUser();
          } else {
            return sweetError("未引入选择用户模块");
          }
        }
        var app = this;
        SelectUser.open(function(data) {
          var usersId = data.usersId;
          var users = data.users;
          app.users = app.users.concat(users);
          var permissionUid = app.survey.permission.uid;
          for(var i = 0; i < usersId.length; i++) {
            var uid = usersId[i];
            if(permissionUid.indexOf(uid) === -1) {
              permissionUid.push(uid);
            }
          }
        }, {
          userCount: 999,
          selectedUsersId: this.survey.permission.uid || []
        });
      },
      addResource: function(o) {
        if(!window.SelectResource) {
          if(NKC.modules.SelectResource) {
            window.SelectResource = new NKC.modules.SelectResource();
          } else {
            return sweetError("未引入选择资源附件模块");
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
      // 复制问题或选项
      copy: function(arr, o) {
        if(o) {
          arr.push(JSON.parse(JSON.stringify(o)));
        } else {
          arr.push(JSON.parse(JSON.stringify(arr[arr.length - 1])));
        }
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
          }).catch(function(){})

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
      // 为了兼容草稿保存，取消了前端提交前的数据检测。
      submit: function() {
        if(this.disabled) return;
        this.error = "";
        var survey = JSON.parse(JSON.stringify(this.survey));
        var this_ = this;
        for(var i = 0; i < survey.options.length; i++) {
          var option = survey.options[i];
          option.links = this_.modifyLinks(option.links_, "str");
          for(var j = 0; j < option.answers.length; j++) {
            var answer = option.answers[j];
            if(survey.type === "score") {
              answer.maxScore = parseFloat(answer.maxScore.toFixed(2));
              answer.minScore = parseFloat(answer.minScore.toFixed(2));
            }
            answer.links = this_.modifyLinks(answer.links_, "str");
          }
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
        survey.reward.onceKcb = parseFloat(survey.reward.onceKcb || 0);
        survey.reward.rewardCount = parseInt(survey.reward.rewardCount || 0);
        survey.reward.onceKcb = survey.reward.onceKcb*100;
        return survey;
      },
      // 旧
      submit_: function() {
        if(this.disabled) return;
        this.error = "";
        var te = this.te;
        var survey = JSON.parse(JSON.stringify(this.survey));
        var this_ = this;
        if(survey.type !== "vote") {
          this.checkString(survey.description, {
            name: "调查说明",
            min: 1
          });
        }
        if(!survey.options || !survey.options.length) return te("请至少添加一个问题");
        for(var i = 0; i < survey.options.length; i++) {
          var option = survey.options[i];
          this.checkString(option.content, {
            name: "问题" + (i+1) + "的内容",
            min: 1
          });
          option.links = this_.modifyLinks(option.links_, "str");
          if(!option.answers || !option.answers.length) return te("请为每个问题至少添加一个选项");
          for(var j = 0; j < option.answers.length; j++) {
            var answer = option.answers[j];
            this.checkString(answer.content, {
              name: "问题" + (i+1) + "的选项内容",
              min: 1
            });
            if(survey.type === "score") {
              answer.maxScore = parseFloat(answer.maxScore.toFixed(2));
              answer.minScore = parseFloat(answer.minScore.toFixed(2));
              this.checkNumber(answer.minScore, {
                name: "问题" + (i+1) + "选项的最小分值",
                min: -150,
                max: 150,
                fractionDigits: 2
              });
              this.checkNumber(answer.maxScore, {
                name: "问题" + (i+1) + "选项的最大分值",
                min: -150,
                max: 150,
                fractionDigits: 2
              });
              if(answer.maxScore <= answer.minScore) return te("最大分值必须大于最小分值");
            }
            answer.links = this_.modifyLinks(answer.links_, "str");
          }
          if(survey.type !== "score") {
            this.checkNumber(option.minVoteCount, {
              name: "问题" + (i+1) + "的最小选择数量",
              min: 1,
              max: option.answers.length
            });
            this.checkNumber(option.maxVoteCount, {
              name: "问题" + (i+1) + "的最大选择数量",
              min: 1,
              max: option.answers.length
            });
            if(option.minVoteCount > option.maxVoteCount) return te("最小选择数量不能超过最大选择数量");
          }
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
        survey.reward.onceKcb = parseFloat(survey.reward.onceKcb);
        survey.reward.rewardCount = parseInt(survey.reward.rewardCount);
        if(survey.reward.status) {
          this.checkNumber(survey.reward.onceKcb, {
            name: "单次奖励的科创币",
            min: 0.01,
            max: 100,
            fractionDigits: 2
          });
          this.checkNumber(survey.reward.rewardCount, {
            name: "总奖励次数",
            min: 1
          });
        }
        survey.reward.onceKcb = survey.reward.onceKcb*100;
        return survey;
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
          data.survey.reward.onceKcb = data.survey.reward.onceKcb/100;
          self.app.survey = data.survey;
          self.app.disabled = false;
          self.app.users = data.allowedUsers;
          self.app.targetUser = data.targetUser;
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
