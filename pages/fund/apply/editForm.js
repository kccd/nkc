
var ue;
var appButton;
var data = getDataById("data");
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

    saveError: "",
    saveInfo: "",

  },
  mounted: function() {
    if(document.getElementById("project")) {
      ue = UE.getEditor("project", {
        toolbars: [
          [
            'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor',  '|', 'indent', '|','link', 'unlink', '|', 'emotion', 'inserttable', '|' ,'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|'
          ]
        ],
        maximumWords: 100000, // 最大字符数
        initialFrameHeight: 500, // 编辑器高度
        autoHeightEnabled:false, // 编辑器是否随着行数增加而自动长高
        scaleEnabled: true, // 是否允许拉长
        topOffset: 50, // toolbar工具栏在滚动时的固定位置
        //- imagePopup: false, // 是否开启图片调整浮层
        //- enableContextMenu: false, // 是否开启右键菜单
        enableAutoSave: false, // 是否启动自动保存
        elementPathEnabled: false, // 是否显示元素路径
        imageScaleEnabled: false, // 启用图片拉伸缩放
      });
      ue.ready(function() {
        ue.setContent(app.form.project.c)
      });

      paperProto.init(data.form.project)
    }
  },
  watch: {
    saveError: function() {
      appButton.saveError = this.saveError;
    },
    saveInfo: function() {
      appButton.saveInfo = this.saveInfo;
    }
  },
  computed: {
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
    strToHTML: NKC.methods.strToHTML,
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
      var url = "/fund/a/" + this.form._id + "/settings?s=" + (step + 1);
      if(type === "last") {
        url = "/fund/a/" + this.form._id + "/settings?s=" + (step - 1)
      }
      this.save(function() {
        window.location.href = url;
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
    save: function(callback) {
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
        if(!project.t) return app.saveError = "请输入项目名称";
        if(!project.abstractCn) return app.saveError = "中文摘要不能为空";
        if(!project.c) return app.saveError = "请输入项目内容";
        body.project = project;
      }

      nkcAPI(url, method, body)
        .then(function() {
          if(callback) {
            callback();
          } else {
            app.saveInfo = "保存成功";
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
    saveError: "",
    saveInfo: ""
  },
  methods: {
    saveFunc: app.saveFunc,
    switchStep: app.switchStep
  }
});