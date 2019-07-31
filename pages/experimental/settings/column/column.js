var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    columnSettings: data.columnSettings,
    grades: data.grades,
    roles: data.roles,
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
      if(columnSet.pageCount < 0) return this.error = "自定义页面个数不能小于0";
      if(!columnSet.contributeInfo) return this.error = "请输入投稿说明";
      if(!columnSet.transferInfo) return this.error = "请输入专栏转让说明";
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