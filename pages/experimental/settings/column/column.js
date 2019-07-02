var data = getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    columnSettings: data.columnSettings,
    grades: data.grades,
    error: "",
    info: ""
  },
  methods: {
    save: function() {
      this.error = "";
      this.info = "";
      var columnSet = this.columnSettings;
      if(columnSet.xsfCount < 0) return this.error = "学术分不能小于0";
      if(columnSet.digestCount < 0) return this.error = "精华数不能小于0";
      if(columnSet.userGrade < 0) return this.error = "至少勾选一个用户等级";
      if(columnSet.threadCount < 0) return this.error = "文章数不能小于0";
      if(!columnSet.contributeInfo) return this.error = "请输入投稿说明";
      nkcAPI("/e/settings/column", "PATCH", columnSet)
        .then(function() {
          app.info = "保存成功";
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    }
  }
});