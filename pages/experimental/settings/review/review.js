var data = NKC.methods.getDataById("data");
var wordGroup = data.reviewSettings.keyword.wordGroup;
for(var i in wordGroup) {
  wordGroup[i].status = "display";
  wordGroup[i].input = "";
}

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
    selectedCertId: "",
    leastKeywordTimes: data.reviewSettings.keyword.condition.leastKeywordTimes,
    leastKeywordCount: data.reviewSettings.keyword.condition.leastKeywordCount,
    relationship: data.reviewSettings.keyword.condition.relationship,
    wordGroup: data.reviewSettings.keyword.wordGroup || [],
    newWordGroupName: "",
    newWordGroupKeywords: null
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
      nkcAPI("/e/settings/review", "PUT", {
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
      nkcAPI("/e/settings/review", "PUT", {
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
      nkcAPI("/e/settings/review", "PUT", {
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
      nkcAPI("/e/settings/review", "PUT", {
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
      nkcAPI("/e/settings/review", "PUT", {
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
    },
    // 启停关键词功能
    triggerKeyword: function(val) {
      nkcAPI("/e/settings/review/keyword", "PUT", {
        type: "enable",
        value: val
      });
    },
    // 删除关键词库
    deleteWordGroup: function(index) {
      var self = this;
      var name = self.wordGroup[index].name;
      sweetConfirm("确定要删除这个关键词组吗?")
        .then(function() {
          return nkcAPI("/e/settings/review/keyword", "PUT", {
            type: "deleteWordGroup",
            value: name
          });
        })
        .then(function() {
          self.wordGroup.splice(index, 1);
        })
    },
    // 添加关键词组
    addWordGroup: function() {
      var self = this;
      if(!self.newWordGroupName || !self.newWordGroupKeywords) return;
      var newWordGroup = {
        name: self.newWordGroupName,
        keywords: self.newWordGroupKeywords
      };
      sweetConfirm("确认添加新敏感词词组:" + newWordGroup.name + "吗？包含关键词: " + newWordGroup.keywords.join("、"))
        .then(function() {
          return nkcAPI("/e/settings/review/keyword", "PUT", {
            type: "addWordGroup",
            value: newWordGroup
          })
        })
        .then(function() {
          self.wordGroup.push(newWordGroup);
        })
        .catch(sweetError)
        .then(function() {
          self.newWordGroupName = "";
          self.newWordGroupKeywords = null;
        })
    },
    // 更新送审条件
    updateReviewCondition: function() {
      var self = this;
      var update = {
        leastKeywordTimes: self.leastKeywordTimes,
        leastKeywordCount: self.leastKeywordCount,
        relationship: self.relationship
      };
      nkcAPI("/e/settings/review/keyword", "PUT", {
        type: "reviewCondition",
        value: update
      });
    },
    // 选择了关键词文件
    keywordFile: function(file) {
      var breakFilename = file.name.split(".");
      if(breakFilename.length > 1) breakFilename.pop();
      var groupName = breakFilename.join(".");
      var self = this;
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function() {
        var keywords = reader.result.split(/[\r]{0,1}\n/);
        if(!keywords.length) {
          return sweetWarning("无新的关键字");
        }
        self.newWordGroupKeywords = keywords;
        if(!self.newWordGroupName) {
          self.newWordGroupName = groupName;
        }
      }
    },
    // 添加关键词
    addKeyword: function(groupIndex) {
      var self= this;
      var wordGroup = this.wordGroup;
      var input = wordGroup[groupIndex].input;
      var keywords = input.split(/\s+/);
      sweetConfirm("确认向本组("+ wordGroup[groupIndex].name +")添加以下敏感词吗?:" + keywords.join("、"))
        .then(function() {
          return nkcAPI("/e/settings/review/keyword", "PUT", {
            type: "addKeywords",
            value: {
              name: wordGroup[groupIndex].name,
              keywords
            }
          })
        })
        .then(function(data) {
          var added = data.added;
          var addedCount = added.length;
          for(var i in added) {
            var newKeyword = added[i];
            wordGroup[groupIndex].keywords.push(newKeyword);
          }
          self.cancelKeywordOperating(groupIndex);
          setTimeout(function() {
            $(self.$refs["keywordCount"+groupIndex][0]).attr("data-add-number", "+" + addedCount);
          }, 50);
          if(addedCount) {
            return sweetAlert("已添加: " + added.join("、"))
          } else {
            return sweetAlert("没有添加新的敏感词");
          }
        })
        .catch(sweetError);
    },
    // 删除关键词
    deleteKeyword: function(groupIndex) {
      var self = this;
      var wordGroup = this.wordGroup;
      var input = wordGroup[groupIndex].input;
      var keywords = input.split(/\s+/);
      sweetConfirm("确认删除本组("+ wordGroup[groupIndex].name +")中的以下敏感词吗?:" + keywords.join("、"))
        .then(function() {
          return nkcAPI("/e/settings/review/keyword", "PUT", {
            type: "deleteKeywords",
            value: {
              name: wordGroup[groupIndex].name,
              keywords
            }
          })
        })
        .then(function(data) {
          var deleted = data.deleted;
          var deletedCount = deleted.length;
          for(var i in deleted) {
            var deleteKeyword = deleted[i];
            var group = wordGroup[groupIndex];
            var index = group.keywords.indexOf(deleteKeyword);
            if(index >= 0) {
              group.keywords.splice(index, 1);
            }
          }
          self.cancelKeywordOperating(groupIndex);
          setTimeout(function() {
            $(self.$refs["keywordCount"+groupIndex][0]).attr("data-add-number", "-" + deletedCount);
          }, 50);
          if(deletedCount) {
            sweetAlert("已删除: " + deleted.join("、"))
          } else {
            sweetAlert("没有删除任何敏感词")
          }
        })
        .catch(sweetError);
    },
    // 关键字操作
    keywordOperating: function(groupIndex) {
      var wordGroup = this.wordGroup;
      for(var i in wordGroup) {
        this.cancelKeywordOperating(i);
      }
      wordGroup[groupIndex].status = "add";
    },
    // 取消关键字操作
    cancelKeywordOperating: function(groupIndex) {
      var wordGroup = this.wordGroup;
      wordGroup[groupIndex].status = "display";
      wordGroup[groupIndex].input = "";
    },
    // 导出一个组的所有敏感词
    exportWordGroup: function(groupIndex) {
      var group = this.wordGroup[groupIndex];
      var content = group.keywords.join("\n");
      var downloader = document.createElement("a");
      downloader.setAttribute("href", "data:text/plain;charset=utf-8," + content);
      downloader.setAttribute("download", "敏感词组_" + group.name + ".txt");
      downloader.click();
    }
  }
});
