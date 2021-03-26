var data = NKC.methods.getDataById("data");
var keywordSetting = data.keywordSetting || {
  enable: false,
  wordGroup: []
};
function initGroup(group) {
  group.rename = false;
  group.keywordView = false;
  group.pageIndex = 0;
  group.searchInputText = "";
  group.searchedWords = [];
}
var wordGroup = keywordSetting.wordGroup;
wordGroup.map(function(group) {
  initGroup(group);
});

var app = new Vue({
  el: '#app',
  data: {
    keywordSetting: keywordSetting,
    form: {
      groupName: "",
      keywords: null,
    },
    add: false,
  },
  methods: {
    // 启停关键词功能
    triggerKeyword: function(val) {
      nkcAPI("/e/settings/review/keyword", "PUT", {
        type: "enable",
        value: val
      })
      .then(function() {
        sweetAlert(val ? "已启用" : "已禁用")
      })
      .catch(sweetError)
    },
    // 删除关键词组
    deleteWordGroup: function(index) {
      var self = this;
      var id = self.keywordSetting.wordGroup[index].id;
      sweetConfirm("确定要删除这个关键词组吗?")
        .then(function() {
          return nkcAPI("/e/settings/review/keyword", "PUT", {
            type: "deleteWordGroup",
            value: id
          });
        })
        .then(function() {
          self.keywordSetting.wordGroup.splice(index, 1);
        })
    },
    // 添加关键词组
    addWordGroup: function() {
      var self = this;
      if(!self.form.keywords) return;
      var newWordGroup = {
        name: self.form.groupName,
        keywords: self.form.keywords,
        conditions: {
          count: 1,
          times: 1,
          logic: "or"
        }
      };
      initGroup(newWordGroup);
      sweetConfirm("确认添加新敏感词词组:" + newWordGroup.name + "吗？共包含关键词: " + newWordGroup.keywords.length + "个关键词。")
        .then(function() {
          return nkcAPI("/e/settings/review/keyword", "PUT", {
            type: "addWordGroup",
            value: newWordGroup
          })
        })
        .then(function(data) {
          newWordGroup.id = data.id;
          self.keywordSetting.wordGroup.push(newWordGroup);
          sweetAlert("已添加");
        })
        .catch(sweetError)
        .then(function() {
          self.form.groupName = "";
          self.form.keywords = null;
        })
    },
    // 重命名关键词组
    renameGroup: function(index) {
      var self = this;
      var group = self.keywordSetting.wordGroup[index];
      var newName = group.name;
      return nkcAPI("/e/settings/review/keyword", "PUT", {
        type: "renameWordGroup",
        value: {
          id: group.id,
          newName: newName
        }
      })
      .then(function() {
        group.rename = false;
      })
      .catch(sweetError)
    },
    // 更新送审条件
    updateReviewCondition: function(group) {
      nkcAPI("/e/settings/review/keyword", "PUT", {
        type: "reviewCondition",
        value: {
          id: group.id,
          conditions: group.conditions
        }
      })
      .catch(sweetError)
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
        self.form.keywords = keywords.filter(function(keyword) {
          return !!keyword;
        });
        if(!self.form.groupName) {
          self.form.groupName = groupName;
        }
      }
    },
    // 添加关键词
    addKeyword: function(groupIndex) {
      var wordGroup = this.keywordSetting.wordGroup;
      var group = wordGroup[groupIndex];
      var keyword = window.prompt("请输入一个关键词(中、英(不区分大小)、数字)", "");
      if(!keyword) return;
      var shouldAddKeyword = keyword.toLowerCase();
      nkcAPI("/e/settings/review/keyword", "PUT", {
        type: "addKeywords",
        value: {
          groupId: group.id,
          keyword: shouldAddKeyword
        }
      })
      .then(function(data) {
        var added = data.added;
        if(added) {
          sweetAlert("已添加");
          group.keywords.push(shouldAddKeyword);
        } else {
          sweetWarning("重复添加");
        }
      })
      .catch(sweetError);
    },
    // 删除关键词
    deleteKeyword: function(groupIndex, wordIndex) {
      var wordGroup = this.keywordSetting.wordGroup;
      var group = wordGroup[groupIndex];
      var word = group.keywords[wordIndex];
      sweetConfirm("确认删除词组 \""+ group.name +"\" 中的 \""+ word +"\" 关键词吗?")
        .then(function() {
          return nkcAPI("/e/settings/review/keyword", "PUT", {
            type: "deleteKeywords",
            value: {
              groupId: group.id,
              keyword: word,
            }
          })
        })
        .then(function() {
          sweetAlert("已删除");
          group.keywords.splice(wordIndex, 1);
        })
        .catch(sweetError);
    },
    // 导出一个组的所有敏感词
    exportWordGroup: function(groupIndex) {
      var group = this.keywordSetting.wordGroup[groupIndex];
      var content = group.keywords.join("\n");
      var downloader = document.createElement("a");
      downloader.setAttribute("href", "data:text/plain;charset=utf-8," + content);
      downloader.setAttribute("download", "敏感词组_" + group.name + ".txt");
      downloader.click();
    },
    // 应用到所有专业
    applyAllForums: function(groupIndex) {
      var id = self.keywordSetting.wordGroup[groupIndex].id;
      sweetConfirm("确定要将这个词组应用到所有专业吗?")
      .then(function() {
        return nkcAPI("/e/settings/review/keyword", "PUT", {
          type: "applyAllForums",
          value: id
        })
      })
      .then(function() {
        sweetAlert("成功");
      })
      .catch(sweetError);
    },
    // 关键字搜索框
    searchWordInputChange: function(el, groupIndex) {
      var group = this.keywordSetting.wordGroup[groupIndex];
      group.searchedWords.length = 0;
      if(!group.searchInputText) return;
      group.keywords.forEach(function(keyword) {
        if(keyword.indexOf(el.value) !== -1) {
          group.searchedWords.push(keyword);
        }
      });
    },
    // 删除搜索到的关键字
    deleteSearchedKeyword: function(groupIndex, word) {
      var group = this.keywordSetting.wordGroup[groupIndex];
      var wordIndex = group.keywords.indexOf(word);
      if(wordIndex < 0) {
        return sweetWarning("删除异常，此词组中不存在此关键字");
      }
      sweetConfirm("确认删除词组 \""+ group.name +"\" 中的 \""+ word +"\" 关键词吗?")
        .then(function() {
          return nkcAPI("/e/settings/review/keyword", "PUT", {
            type: "deleteKeywords",
            value: {
              groupId: group.id,
              keyword: word,
            }
          })
        })
        .then(function() {
          sweetAlert("已删除");
          group.keywords.splice(wordIndex, 1);
          group.searchInputText = "";
          group.searchedWords.length = 0;
        })
        .catch(sweetError);
    },

    // 打开送审条件编辑
    startEdit: function(target) {
      
    },
    // 关闭送审条件编辑
    endEdit: function(target, group, key) {
      var number = parseInt(target.innerText, 10);
      group.conditions[key] = number;
      this.updateReviewCondition(group)
    }
  }
});