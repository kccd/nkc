var data = getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    column: data.column,
    categories: data.categories,
    columnPosts: [],
    category: "",
    threads: "",
    paging: "",

    editInfo: false,

    error: "",

    selectedColumnPostsId: [],

    selectMul: false,
  },
  mounted: function() {
    if(this.categories.length !== 0) {
      this.selectCategory(this.categories[0]);
    }
    moduleToColumn.init();
  },
  methods: {
    format: NKC.methods.format,
    moveSelected: function() {
      var selectedColumnPostsId = this.selectedColumnPostsId;
      if(selectedColumnPostsId.length === 0) return screenTopWarning("请勾选需要处理的文章");
      moduleToColumn.show(function(data) {
        var categoryId = data.categoryId;
        nkcAPI("/m/" + app.column._id + "/post", "POST", {
          type: "moveById",
          postsId: selectedColumnPostsId,
          categoryId: categoryId
        })
          .then(function() {
            app.selectCategory(app.category);
            app.getCategories();
            moduleToColumn.hide();
          })
          .catch(function(data) {
            screenTopWarning(data);
          })
      });
    },
    getCategories: function() {
      nkcAPI("/m/" + this.column._id + "/category", "GET")
        .then(function(data) {
          app.categories = data.categories;
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    getPostById: function(_id) {
      var columnPosts = this.columnPosts;
      for(var i = 0; i < columnPosts.length; i++) {
        if(_id === columnPosts[i]._id) return columnPosts[i];
      }
    },
    removePostById: function(_id) {
      var columnPosts = this.columnPosts;
      for(var i = 0; i < columnPosts.length; i++) {
        if(_id === columnPosts[i]._id) {
          columnPosts.splice(i, 1);
          break;
        }
      }
    },
    selectMulPosts: function() {
      this.selectMul = !this.selectMul;
      this.selectedColumnPostsId = [];
    },
    removeSelected: function() {
      if(!confirm("确认要从专栏删除已勾选的文章？")) return;
      var selectedColumnPostsId = this.selectedColumnPostsId;
      nkcAPI("/m/" + this.column._id + "/post", "POST", {
        type: "removeColumnPostById",
        postsId: selectedColumnPostsId
      })
        .then(function() {
          app.getCategories();
          for(var i = 0 ; i < selectedColumnPostsId.length; i++) {
            app.removePostById(selectedColumnPostsId[i]);
          }
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    selectAll: function() {
      var columnPosts = this.columnPosts;
      var selectedColumnPostsId = this.selectedColumnPostsId;
      if(columnPosts.length !== selectedColumnPostsId.length) {
        var arr = [];
        for(var i = 0; i < columnPosts.length; i++) {
          arr.push(columnPosts[i]._id);
        }
        this.selectedColumnPostsId = arr;
      } else {
        this.selectedColumnPostsId = [];
      }
    },
    addCategory: function() {
      this.category = {
        name: "",
        description: ""
      };
      this.editInfo = true;
    },
    selectPage: function(type, num) {
      if(type === "null") return;
      this.getPosts(num);
    },
    getPosts: function(page) {
      var cid = this.category._id;
      if(page === undefined) page = this.paging.page;
      nkcAPI("/m/" + this.column._id + "/post?cid=" + cid + "&page=" + page, "GET")
        .then(function(data) {
          app.columnPosts = data.columnPosts;
          app.paging = data.paging;
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    init: function() {
      this.selectedColumnPostsId = [];
      this.paging = {
        page: 0,
        buttonValue: []
      };
      this.editInfo = false;
      this.selectMul = false;
    },
    selectCategory: function(category) {
      this.init();
      this.category = category;
      this.getPosts(0);
    },
    cancelAdd: function() {
      this.init();
      if(!this.category && !this.category._id && this.categories.length > 0) {
        this.selectCategory(this.categories[0])
      }
    },
    removeCategory: function(category) {
      if(!confirm("确认要删除分类？")) return;
      nkcAPI("/m/" + this.column._id + "/category/" + category._id, "DELETE")
        .then(function() {
          var index = app.categories.indexOf(category);
          if(index !== -1) app.categories.splice(index, 1);
          if(app.categories.length > 0) app.selectCategory(app.categories[0]);
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    saveInfo: function() {
      this.error = "";
      var category = this.category;
      if(!category.name) return this.error = "请输入分类名";
      if(!category.description) return this.error = "请输入分类介绍";
      if(category._id) { // 修改分类
        nkcAPI("/m/" + this.column._id + "/category/" + category._id, "PATCH", category)
          .then(function() {
            app.editInfo = false;
          })
          .catch(function(data) {
            app.error = data.error || data;
          });
      } else { // 新建分类
        nkcAPI("/m/" + this.column._id + "/category", "POST", category)
          .then(function(data) {
            app.categories.push(data.category);
            app.editInfo = false;
            app.selectCategory(data.category);
          })
          .catch(function(data) {
            app.error = data.error || data;
          });
      }

    }
  }
});