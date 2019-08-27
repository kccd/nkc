NKC.modules.PostSurveyEdit = function() {
  var self = this;
  var reg = /^(http|https):\/\//i;
  self.app = new Vue({
    el: "#modulePostSurveyEdit",
    data: {
      canClickButton: false,
      ps: "",
      options: [],
      answers: []
    },
    methods: {
      addAnswer: function() {
        this.answers.push({
          content: "",
          description: ""
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
            self.app.options.splice(index, 1);
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
        this.options.push({
          title: "",
          description: "",
          links: [],
          resourcesId: []
        });
      },
      moveOption: function(type, o) {
        var options = this.options;
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
      addOptionAnswer: function() {
        this.answers.push({
          content: "",
          description: ""
        });

      },
      removeAnswer: function(index) {
        this.answers.splice(index, 1);
      },
      newSurvey: function() {
        this.ps = JSON.parse(JSON.stringify({
          type: "survey",  // vote, survey, score
          description: "",
          reward: {
            status: false,
            onceKcb: 0,
            rewardCount: 0
          }
        }));
      },
      selectType: function(type) {
        this.ps.type = type;
      }
    }
  });
  self.init = function(options) {
    options = options || {};
    if(options.psId) {
      nkcAPI("/survey/" + options.psId, "GET")
        .then(function(data) {
          self.app.ps = data.survey;
          for(var i = 0; i < data.options.length; i++) {
            var option = data.options[i];
            var links_ = [];
            for(var j = 0; j < option.links.length; j++) {
              var link = option.links[j];
              links_.push({
                index: j,
                link: link
              });
            }
            option.links = links_;
          }
          self.options = data.options;
          self.answers = data.answers;
        })
        .catch(function(data) {
          sweetError(data);
        })
    } else {
      self.app.newSurvey();
    }
  };
  self.getSurveyData = function() {
    return {
      ps: self.app.ps,
      options: self.app.ps
    };
  }
};