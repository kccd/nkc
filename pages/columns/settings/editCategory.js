var data = NKC.methods.getDataById("data");
if(!data.category) {
  data.category = {
    name: "",
    description: "",
    parentId: ""
  }
}
var app = new Vue({
  el: "#app",
  data: {
    category: data.category,
    categoryList: data.categoryList,
    column: data.column,
    error: "",
    info: ""
  },
  mounted: function() {
    moduleToColumn.init();
  },
  methods: {
    selectCategory: function() {
      moduleToColumn.show(function(d) {
        app.category.parentId = d.categoryId;
        moduleToColumn.hide();
      }, {
        exclude: [app.category._id]
      });
    },
    getCategoryById: function(_id) {
      for(var i = 0; i < this.categoryList.length; i++) {
        var c = this.categoryList[i];
        if(_id === c._id) return c;
      }
    },
    getCategoryNameById: function(_id) {
      var c = this.getCategoryById(_id);
      if(c) return c.name;
      return "无";
    },
    save: function() {
      this.error = "";
      this.info = "";
      var category = this.category;
      if(!category.name) return this.error = "请输入分类名";
      if(!category.description) return this.error = "请输入分类介绍";
      if(category._id) { // 修改分类
        nkcAPI("/m/" + this.column._id + "/category/" + category._id, "PUT", category)
          .then(function() {
            app.info = "保存成功";
          })
          .catch(function(data) {
            app.error = data.error || data;
          });
      } else { // 新建分类
        nkcAPI("/m/" + this.column._id + "/category", "POST", category)
          .then(function() {
            app.info = "保存成功";
          })
          .catch(function(data) {
            app.error = data.error || data;
          });
      }
    },
  }
});
