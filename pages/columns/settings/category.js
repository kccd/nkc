var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    column: data.column,
    categoryList: data.categoryList,
    categoryTree: data.categoryTree,
    category: "",
    error: "",
    info: ""
  },
  mounted: function() {
    this.reset();
    moduleToColumn.init();
  },
  methods: {
    initData: function(callback) {
      nkcAPI("/m/" + this.column._id + "/settings/category", "GET")
        .then(function(data) {
          app.categoryList = data.categoryList;
          if(callback) callback();
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    selectCategoryList: function(c) {
      this.error = "";
      this.info = "";
      this.category = "";
      setTimeout(function() {
        app.category = c;
      }, 200)
    },
    remove: function(category) {
      if(!confirm("确认要删除该分类？")) return;
      nkcAPI("/m/" + this.column._id + "/category/" + category._id, "DELETE")
        .then(function() {
          app.initData(function() {
            app.reset();
          });
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    getCategoryById: function(_id) {
      for(var i = 0; i < this.categoryList.length; i++) {
        var c = this.categoryList[i];
        if(_id === c._id) return c;
      }
    },
    getChildrenById: function(_id) {
      var arr = [];
      for(var i = 0; i < this.categoryList.length; i++) {
        var c = this.categoryList[i];
        if(_id === c.parentId) arr.push(c);
      }
      return arr
    },
    getChildrenIdById: function(_id) {
      var arr = this.getChildrenById(_id);
      var arr_ = [];
      for(var i = 0; i < arr.length; i++) {
        arr_.push(arr[i]._id);
      }
      return arr_;
    },
    getCategoryNameById: function(_id) {
      var c = this.getCategoryById(_id);
      if(c) return c.name;
      return "无";
    },
    reset: function() {
      if(this.categoryList.length > 0) {
        this.category = this.categoryList[0];
      }
    },
    selectCategory: function() {
      moduleToColumn.show(function(d) {
        app.category.parentId = d.categoryId;
        moduleToColumn.hide();
      }, {
        exclude: [app.category._id]
      });
    },
    save: function() {
      this.error = "";
      this.info = "";
      var category = this.category;
      if(!category.name) return this.error = "请输入分类名";
      if(!category.description) return this.error = "请输入分类介绍";
      if(category._id) { // 修改分类
        nkcAPI("/m/" + this.column._id + "/category/" + category._id, "PATCH", category)
          .then(function() {
            app.initData();
            app.info = "保存成功";
          })
          .catch(function(data) {
            app.error = data.error || data;
          });
      } else { // 新建分类
        nkcAPI("/m/" + this.column._id + "/category", "POST", category)
          .then(function(data) {
            app.initData();
            app.category._id = data.category._id;
            app.info = "创建分类成功";
          })
          .catch(function(data) {
            app.error = data.error || data;
          });
      }
    },
    addCategory: function() {
      this.error = "";
      this.info = "";
      this.category = {
        name: "",
        description: "",
        parentId: null
      }
    },
    move: function(type, category) {
      var parentId = category.parentId;
      var childrenId = app.getChildrenIdById(parentId);
      var index = childrenId.indexOf(category._id);
      if(type === "up") {
        if(index === 0) return;
        var lastCategoryId = childrenId[index-1];
        childrenId[index-1] = category._id;
        childrenId[index] = lastCategoryId;
      } else if(type === "down") {
        if((index+1) === childrenId.length) return;
        var nextCategoryId = childrenId[index+1];
        childrenId[index+1] = category._id;
        childrenId[index] = nextCategoryId;
      } else if(type === "top") {
        if(index === 0) return;
        childrenId.splice(index, 1);
        childrenId.unshift(category._id);
      } else if(type === "bottom") {
        if((index+1) === childrenId.length) return;
        childrenId.splice(index, 1);
        childrenId.push(category._id);
      }
      nkcAPI("/m/" + this.column._id + "/category", "PATCH", {
        type: "changeOrder",
        categoriesId: childrenId
      })
        .then(function() {
          app.initData();
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    }
  }
});