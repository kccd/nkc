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
    checkNumber: NKC.methods.checkData.checkNumber,
    save: function() {
      var self = this;
      this.error = "";
      this.info = "";
      var columnSet = this.columnSettings;
      return Promise.resolve()
        .then(function() {
          self.checkNumber(columnSet.xsfCount, {
            name: '开设条件 学术分',
            min: 0
          });
          self.checkNumber(columnSet.digestCount, {
            name: '开设条件 精华数',
            min: 0,
          });
          self.checkNumber(columnSet.threadCount, {
            name: '开设条件 文章数',
            min: 0
          });
          if(columnSet.userGrade < 0) throw new Error("至少勾选一个用户等级");
          if(!columnSet.contributeInfo) throw new Error("请输入投稿说明");
          if(!columnSet.transferInfo) throw new Error("请输入专栏转让说明");
          self.checkNumber(columnSet.pageCount, {
            name: '专栏设置 自定义页面个数',
            min: 0
          });
          self.checkNumber(columnSet.columnHomePostCountMin, {
            name: '专栏列表 最小文章数',
            min: 0
          });
          return nkcAPI("/e/settings/column", "PUT", columnSet)
        })
        .then(function() {
          sweetSuccess('保存成功');
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});
