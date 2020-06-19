var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    tab: "thread", // thread, post
    grades: data.grades,
    certs: data.certs,
    reviewSettings: data.reviewSettings,
    users: data.users,
    uid: {
      blacklist: "",
      whitelist: ""
    },
    conditions: [],
    selectedCertId: ""
  },
  watch: {
    tab: function() {
      this.extendConditions();
    }
  },
  computed: {
    selectedCerts: function() {
      var arr = [];
      var certsId = this.reviewSettings.certsId;
      for(var i = 0; i < certsId.length; i ++ ) {
        var cert = this.getCertById(certsId[i]);
        if(cert) arr.push(cert);
      }
      return arr;
    },
    review: function() {
      return this.reviewSettings[this.tab];
    },
    blacklistUsers: function() {
      var arr = [];
      for(var i = 0; i < this.review.special.blacklistUid.length; i++) {
        arr.push(this.getUserById(this.review.special.blacklistUid[i]));
      }
      return arr;
    },
    whitelistUsers: function() {
      var arr = [];
      for(var i = 0; i < this.review.special.whitelistUid.length; i++) {
        arr.push(this.getUserById(this.review.special.whitelistUid[i]));
      }
      return arr;
    }
  },
  mounted: function() {
    this.extendConditions();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    saveCertId: function() {
      nkcAPI("/e/settings/review", "PATCH", {
        type: 'saveCertsId',
        certsId: app.reviewSettings.certsId
      })
        .then(function() {
          screenTopAlert("保存成功");
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    removeCertId: function(id) {
      var index = this.reviewSettings.certsId.indexOf(id);
      if(index !== -1) {
        this.reviewSettings.certsId.splice(index, 1);
      }
    },
    addCertId: function() {
      var id = this.selectedCertId;
      if(!id) return;
      if(this.reviewSettings.certsId.indexOf(id) === -1) {
        this.reviewSettings.certsId.push(id);
      }
    },
    getCertById: function(id) {
      for(var i = 0; i < this.certs.length; i++) {
        if(this.certs[i]._id === id) return this.certs[i];
      }
    },
    extendConditions: function() {
      var arr = [];
      arr.push({
        name: "海外手机注册用户",
        id: "foreign",
        status: this.review.blacklist.foreign.status?[true]: [],
        type: this.review.blacklist.foreign.type,
        count: this.review.blacklist.foreign.count
      });
      arr.push({
        name: "未通过A卷考试的用户",
        id: "notPassedA",
        status: this.review.blacklist.notPassedA.status?[true]: [],
        type: this.review.blacklist.notPassedA.type,
        count: this.review.blacklist.notPassedA.count
      });
      for(var i = 0; i < this.grades.length; i++) {
        var grade = this.grades[i];
        var settings = this.getSettings(grade._id);
        arr.push({
          name: "【用户等级】" + grade.displayName,
          id: grade._id,
          isGrade: true,
          status: settings.status?[true]: [],
          type: settings.type,
          count: settings.count
        });
      }
      this.conditions = arr;
    },
    getUserById: function(uid) {
      for(var i = 0; i < this.users.length; i++) {
        var user = this.users[i];
        if(user.uid === uid) return user;
      }
    },
    switchTab: function(type) {
      this.tab = type;
    },
    getSettings: function (gradeId) {
      for(var i = 0 ; i < this.review.blacklist.grades.length; i++ ){
        var grade = this.review.blacklist.grades[i];
        if(gradeId === grade.gradeId) {
          return grade;
        }
      }
      // 若不存在用户等级对应的设置，则新建一个默认的设置，在保存的时候存入数据库。
      return {
        gradeId: gradeId,
        status: false,
        type: "all",
        count: 10
      }
    },
    addUser: function(type) {
      var uid = this.uid[type];
      if(!uid) return screenTopWarning("请输入用户ID");
      nkcAPI("/e/settings/review", "PATCH", {
        tab: this.tab,
        type: "addUser",
        listType: type,
        uid: uid
      })
        .then(function(data) {
          var targetUser = data.targetUser;
          app.users.push(targetUser);
          if(type === "blacklist") {
            if(app.review.special.blacklistUid.indexOf(targetUser.uid) === -1) {
              app.review.special.blacklistUid.push(targetUser.uid);
            }

          } else {
            if(app.review.special.whitelistUid.indexOf(targetUser.uid) === -1) {
              app.review.special.whitelistUid.push(targetUser.uid);
            }
          }
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    removeUser: function(uid, type) {
      nkcAPI("/e/settings/review", "PATCH", {
        tab: this.tab,
        type: "removeUser",
        listType: type,
        uid: uid
      })
        .then(function() {
          var index;
          if(type === "blacklist") {
            index = app.review.special.blacklistUid.indexOf(uid);
            if(index !== -1) {
              app.review.special.blacklistUid.splice(index, 1);
            }
          } else {
            index = app.review.special.whitelistUid.indexOf(uid);
            if(index !== -1) {
              app.review.special.whitelistUid.splice(index, 1);
            }
          }
        })
    },
    saveBlacklist: function() {
      var blacklist = {
        grades: [],
        notPassedA: {},
        foreign: {}
      };
      for(var i = 0; i < this.conditions.length; i++) {
        var c = this.conditions[i];
        if(c.isGrade) {
          blacklist.grades.push({
            gradeId: c.id,
            status: c.status.length > 0,
            type: c.type,
            count: c.count
          });
        } else if(c.id === "foreign") {
          blacklist.foreign = {
            status: c.status.length > 0,
            type: c.type,
            count: c.count
          }
        } else if(c.id === "notPassedA") {
          blacklist.notPassedA = {
            status: c.status.length > 0,
            type: c.type,
            count: c.count
          }
        }
      }
      nkcAPI("/e/settings/review", "PATCH", {
        type: "saveBlacklist",
        tab: this.tab,
        blacklist: blacklist
      })
        .then(function(data) {
          app.reviewSettings[app.tab].blacklist = data.reviewSettings[app.tab].blacklist;
          screenTopAlert("保存成功");
        })
        .catch(function(data) {
          screenTopWarning(data);
        });

    },
    saveWhitelist: function() {
      nkcAPI("/e/settings/review", "PATCH", {
        type: "saveWhitelist",
        tab: this.tab,
        whitelist: app.review.whitelist
      })
        .then(function(data) {
          app.reviewSettings[app.tab].whitelist = data.reviewSettings[app.tab].whitelist;
          screenTopAlert("保存成功");
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    }
  }
});
