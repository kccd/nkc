
var ue;
var appButton;
var data = NKC.methods.getDataById("data");
var selectedMembers = [];

for(var i = 0; i < data.form.members.length; i++) {
  selectedMembers.push(data.form.members[i].user);
}
if(!data.form.project) {
  data.form.project = {
    t: "",
    c: "",

    abstractCn: "", // 默认中文摘要
    abstractEn: "", // 默认英文摘要
    keyWordsCn: [], // 默认中文关键词
    keyWordsEn: [], // 默认英文关键词
  }
}
data.form.project.abstractHeader = "项目摘要";
data.form.project.enableAbstract = true; // 是否启用摘要
data.form.project.enableKeyWords = true; // 是否启用关键词
data.form.project.enableAuthorInfos = false; // 是否启用作者信息
data.form.project.enableOriginState = false; // 是否启用原创声明

if(!data.form.budgetMoney) {
  data.form.budgetMoney = [];
}

var app = new Vue({
  el: "#app",
  data: {
    user: data.user,
    step: Number(data.step),
    form: data.form,
    fund: data.fund,

    showUploadedPhotos: false,
    lifePhotos: data.lifePhotos,

    searchKeyword: "",
    searchError: "",
    selectedMembers: selectedMembers,
    searchUsers: [],
    searchPosts: [],

    selectedPosts: data.form.threads.applying,

    saveError: "",
    saveInfo: "",

    selectedForum: data.form.forum


  },
  mounted: function() {
    if(document.getElementById("project")) {
      ue = UE.getEditor("project", NKC.configs.ueditor.fundConfigs);
      ue.ready(function() {
        ue.setContent(app.form.project.c || "");
      });

      paperProto.init(data.form.project || "");

    }
    vueSelectForum.init({
      func: this.selectForum
    });

    var this_ = this;
    if(this.step === 3) {
      setInterval(function() {
        this_.save();
      }, 180000);
    }

  },
  watch: {
    saveError: function() {
      appButton.saveError = this.saveError;
    },
    saveInfo: function() {
      appButton.saveInfo = this.saveInfo;
    },
    selectedPosts:function() {
      var selectedPosts = this.selectedPosts;
      this.form.threadsId.applying = [];
      for(var i = 0; i < selectedPosts.length; i++) {
        this.form.threadsId.applying.push(selectedPosts[i].tid);
      }
    }
  },
  computed: {
    budgetMoneyTotal: function() {
      var arr = [];
      for(var i = 0; i < this.form.budgetMoney.length; i++) {
        var money = this.form.budgetMoney[i].money;
        var count = this.form.budgetMoney[i].count;
        arr.push(Number(money)*Number(count));
      }
      return arr;
    },
    moneyTotal: function() {
      var total = 0;
      for(var i = 0; i < this.budgetMoneyTotal.length; i++) {
        total += this.budgetMoneyTotal[i];
      }
      return total
    },
    selectedPhotosId: function() {
      var arr = [];
      for(var i = 0; i < this.form.applicant.lifePhotos.length; i++) {
        arr.push(this.form.applicant.lifePhotos[i]._id);
      }
      return arr;
    },
    steps: function() {
      var arr = [
        {
          name: "选择申请方式",
          completed: false
        },
        {
          name: "填写身份信息",
          completed: false
        },
        {
          name: "填写项目内容",
          completed: false
        },
        {
          name: "填写其他信息",
          completed: false
        },
        {
          name: "提交申请",
          completed: false
        }
      ];
      var step = this.step;
      for(var i = 0; i < arr.length; i++) {
        if(step > i) arr[i].completed = true;
      }
      return arr;
    },
    selectedMembersId: function() {
      var arr = [];
      for(var i = 0; i < this.selectedMembers.length; i++) {
        arr.push(this.selectedMembers[i].uid);
      }
      return arr;
    }
  },
  methods: {
    format: NKC.methods.format,
    getUrl: NKC.methods.tools.getUrl,
    strToHTML: NKC.methods.strToHTML,
    visitUrl: NKC.methods.visitUrl,
    selectForum: function(forum) {
      this.selectedForum = forum;
    },
    toUploadPhoto: function() {
      if(!confirm("页面跳转将可能导致当前页面输入的内容丢失，请注意保存！")) return;
      this.visitUrl("/u/"+this.user.uid+"/settings/resume", true);
    },
    floatToInt: function(b) {
      b.money = parseInt(b.money);
      b.count = parseInt(b.count);
    },
    showSelectForum: function() {
      vueSelectForum.app.show();
    },
    searchUser: function() {
      this.searchError = "";
      var keyword = this.searchKeyword;
      if(!keyword) return this.searchError = "请输入用户名或用户ID";
      nkcAPI("/u?uid=" + keyword + "&username=" + keyword, "GET")
        .then(function(data) {
          app.searchUsers = data.targetUsers;
          if(!app.searchUsers.length) app.searchError = "未找到相关用户";
        })
        .catch(function(data) {
          app.searchError = data.error || data;
        });
    },
    clearSearchUsers: function() {
      this.searchUsers = [];
    },
    searchPost: function() {
      this.searchError = "";
      var keyword = this.searchKeyword;
      if(!keyword) return this.searchError = "请输入文号或标题";
      nkcAPI("/t?applicationFormId="+this.form._id+"&type=applicationFormSearch&title=" + keyword + "&pid=" + keyword, "GET")
        .then(function(data) {
          app.searchPosts = data.posts;
          if(!app.searchPosts.length) app.searchError = "未找到相关文章";
        })
        .catch(function(data) {
          app.searchError = data.error || data;
        })
    },
    loadMyPosts: function() {
      nkcAPI("/t?type=myPosts", "GET")
        .then(function(data) {
          app.searchPosts = data.posts;
          if(!app.searchPosts.length) app.searchError = "未找到相关文章";
        })
        .catch(function(data) {
          app.searchError = data.error || data;
        })
    },
    addPost: function(p) {
      if(this.form.threadsId.applying.indexOf(p.tid) === -1) {
        this.selectedPosts.push(p);
      }
    },
    removePost: function(index) {
      this.selectedPosts.splice(index, 1);
    },
    infoMeUsers: function(type) {
      nkcAPI("/u/" + app.user.uid + "?t=" + type, "GET")
        .then(function(data) {
          app.searchUsers = data.users;
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    addMember: function(u) {
      if(this.selectedMembersId.indexOf(u.uid) === -1) {
        this.selectedMembers.push(u);
      }
    },
    removeMember: function(u) {
      var index = this.selectedMembers.indexOf(u);
      if(index !== -1) this.selectedMembers.splice(index, 1);
    },
    switchStep: function(type) {
      var step = this.step;
      if(step >= 5) {
        // return window.location.href = "/fund/a/" + this.form._id + "/settings?s=" + (step - 1);
        return openToNewLocation("/fund/a/" + this.form._id + "/settings?s=" + (step - 1));
      }
      var url = "/fund/a/" + this.form._id + "/settings?s=" + (step + 1);
      if(type === "last") {
        url = "/fund/a/" + this.form._id + "/settings?s=" + (step - 1)
      }
      this.save(function() {
        // window.location.href = url;
        openToNewLocation(url)
      });
    },
    saveFunc: function() {
      this.save();
    },
    reloadPhoto: function() {
      nkcAPI('/me/life_photos', 'GET', {})
        .then(function(data) {
          app.lifePhotos = data.lifePhotos;
        })
        .catch(function(data) {
          screenTopWarning(data.error);
        })
    },
    removePhoto: function(p) {
      var index = this.form.applicant.lifePhotos.indexOf(p);
      if(index !== -1) this.form.applicant.lifePhotos.splice(index, 1);
    },
    addPhoto: function(p) {
      if(this.selectedPhotosId.indexOf(p._id) === -1) {
        this.form.applicant.lifePhotos.push(p);
      }
    },
    addBudget: function() {
      var length = this.form.budgetMoney.length;
      this.form.budgetMoney.push({
        purpose: "用途" + (length + 1),
        count: 0,
        money: 0
      });
    },
    removeBudget: function(index) {
      this.form.budgetMoney.splice(index, 1);
    },
    save: function(callback) {
      this.saveError = "";
      this.saveInfo = "";
      var step = this.step;
      var body = {
        s: step
      }, url = "/fund/a/" + this.form._id, method = "PATCH";
      if(step === 1) {
        this.saveError = "";
        this.saveInfo = "";
        var selectedMembers = this.selectedMembers;
        if(this.form.from === "team" && selectedMembers.length === 0) {
          return this.saveError = "团队申请必须添加至少一个组员";
        }
        body.from = this.form.from;
        body.newMembers = [];
        for(var i = 0; i < this.selectedMembersId.length; i++) {
          body.newMembers.push({uid: this.selectedMembersId[i]});
        }
      } else if(step === 2) {
        body.account = this.form.account;
        var applicant = this.form.applicant;
        var lifePhotosId = this.selectedPhotosId;
        body.newApplicant = {
          name: applicant.name,
          idCardNumber: applicant.idCardNumber,
          mobile: applicant.mobile,
          description: applicant.description,
          lifePhotosId: lifePhotosId
        }
      } else if(step === 3) {
        var project = this.form.project;
        var paperExport = paperProto.paperExport();
        project.keyWordsCn = paperExport.keyWordsCn;
        project.keyWordsEn = paperExport.keyWordsEn;
        project.abstractCn = paperExport.abstractCn;
        project.abstractEn = paperExport.abstractEn;
        project.c = ue.getContent();
        // if(!project.t) return app.saveError = "请输入项目名称";
        // if(!project.abstractCn && this.fund.detailedProject) return app.saveError = "中文摘要不能为空";
        // if(!project.c) return app.saveError = "请输入项目内容";
        body.project = project;
      } else if(step === 4) {
        body.projectCycle = this.form.projectCycle;
        if(!body.projectCycle) return app.saveError = "请输入研究周期";
        body.budgetMoney = this.form.budgetMoney;
        if(body.budgetMoney.length === 0) return app.saveError = "请输入资金预算";
        if(this.fund.thread.count > 0) {
          if(this.form.threadsId.applying.length < this.fund.thread.count) {
            return app.saveError = "请选择技术文章，最少" + this.fund.thread.count + "篇";
          }
          body.threadsId = this.form.threadsId.applying;
        }
        if(!this.selectedForum) return app.saveError = "请选择学科分类";
        body.category = this.selectedForum.fid;
      } else if(step === 5) {

      }

      nkcAPI(url, method, body)
        .then(function() {
          if(callback) {
            callback();
          } else {
            if(app.step === 5) {
              // window.location.href = "/fund/a/" + app.form._id;
              openToNewLocation("/fund/a/" + app.form._id);
            } else {
              app.saveInfo = "保存成功";
            }
          }
        })
        .catch(function(data) {
          app.saveError = data.error || data;
        })
    },
  }
});


appButton = new Vue({
  el: "#app_button",
  data: {
    step: Number(data.step),
    saveError: "",
    saveInfo: ""
  },
  methods: {
    saveFunc: app.saveFunc,
    switchStep: app.switchStep,
    deleteForm: function() {
      var msg = '删除申请表后所有填写的内容都将会被删除，确认要删除吗？';
      if(confirm(msg) === true) {
        nkcAPI('/fund/a/'+app.form._id+'?type=delete', 'DELETE', {})
          .then(function(data) {
            // window.location.href = '/fund/list/'+data.fund._id.toLowerCase();
            openToNewLocation('/fund/list/'+data.fund._id.toLowerCase());
          })
          .catch(function(data) {
            screenTopWarning(data.error);
          })
      }
    },
  }
});
