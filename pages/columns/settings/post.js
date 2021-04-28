var data = NKC.methods.getDataById("data");

var app = new Vue({
  el: "#app",
  data: {
    column: data.column,
    mainCategories: [],
    minorCategories: [],
    columnPosts: [],

    selectedMainCategoryId: 'all',
    selectedMinorCategoryId: 'all',

    threads: "",
    paging: "",

    editInfo: false,

    error: "",

    selectedColumnPostsId: [],

    selectMul: true,
  },
  mounted: function() {
    this.init();
    this.getCategories();
    this.getPosts(0);
    moduleToColumn.init();
  },
  computed: {
    category: function() {
      return this.mainCategory;
    },
    mainCategory: function() {
      var cid = this.selectedMainCategoryId;
      var category;
      for(var i = 0; i < this.mainCategories.length; i ++) {
        var _category = this.mainCategories[i];
        if(_category._id === cid) {
          category = _category;
          break;
        }
      }
      return category;
    },
    minorCategory: function() {
      var cid = this.selectedMinorCategoryId;
      var category;
      for(var i = 0; i < this.minorCategories.length; i ++) {
        var _category = this.minorCategories[i];
        if(_category._id === cid) {
          category = _category;
          break;
        }
      }
      return category;
    }
  },
  methods: {
    format: NKC.methods.format,
    moveSelected: function() {
      var selectedColumnPostsId = this.selectedColumnPostsId;
      if(selectedColumnPostsId.length === 0) return screenTopWarning("请勾选需要处理的文章");
      this.move(selectedColumnPostsId);
    },
    move: function(_id, selectedMainCategoriesId, selectedMinorCategoriesId) {
      moduleToColumn.show(function(data) {
        var minorCategoriesId = data.minorCategoriesId;
        var mainCategoriesId = data.mainCategoriesId;
        nkcAPI("/m/" + app.column._id + "/post", "POST", {
          type: "moveById",
          postsId: _id,
          mainCategoriesId: mainCategoriesId,
          minorCategoriesId: minorCategoriesId
        })
          .then(function() {
            app.selectMainCategory(app.category);
            app.getCategories();
            moduleToColumn.hide();
          })
          .catch(function(data) {
            screenTopWarning(data);
          })
      }, {
        selectMul: true,
        selectedMainCategoriesId: selectedMainCategoriesId,
        selectedMinorCategoriesId: selectedMinorCategoriesId
      });
    },
    movePost: function(type, id) {
      if(["sortByPostTimeDES", "sortByPostTimeASC"].indexOf(type) !== -1) {
        if(!confirm("按发表时间排序后，原有排序将会丢失，确定要执行此操作？")) return;
      }
      nkcAPI("/m/" + this.column._id + "/post", "POST", {
        type: type,
        postsId: id,
        categoryId: app.category._id==="all"? "": app.category._id
      })
        .then(function(data) {
          if(data.columnTopped) app.column.topped = data.columnTopped;
          if(data.categoryTopped) app.category.topped = data.categoryTopped;
          app.getPosts();
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    getCategories: function() {
      var cid = this.selectedMainCategoryId;
      var url = "/m/" + this.column._id + "/category?from=post";
      if(cid && cid !== 'all') url += '&cid=' + cid;
      nkcAPI(url, "GET")
        .then(function(data) {
          app.mainCategories = data.mainCategories;
          app.minorCategories = data.minorCategories;
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
    remove: function(_id) {
      if(!confirm("确认要从专栏删除该文章？")) return;
      nkcAPI("/m/" + this.column._id + "/post", "POST", {
        type: "removeColumnPostById",
        postsId: _id
      })
        .then(function() {
          app.getCategories();
          for(var i = 0 ; i < _id.length; i++) {
            app.removePostById(_id[i]);
          }
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
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
    selectPage: function(type, num) {
      if(type === "null") return;
      this.getPosts(num);
    },
    getPosts: function(page) {
      var cid = this.selectedMainCategoryId;
      var mcid = this.selectedMinorCategoryId;
      if(page === undefined) page = this.paging.page;
      var url = "/m/" + this.column._id + "/post?page=" + page;
      if(cid && cid !== 'all') {
        url += "&cid=" + cid;
      }
      if(mcid && mcid !== 'all') {
        url += '&mcid=' + mcid;
      }
      nkcAPI(url, "GET")
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
    },
    selectMainCategory: function(category, disableGetPosts) {
      this.init();
      this.selectedMainCategoryId = category._id;
      if(!disableGetPosts) {
        this.getPosts(0);
        this.getCategories();
      }
    },
    selectMinorCategory: function(category, disableGetPosts) {
      this.init();
      this.selectedMinorCategoryId = category._id;
      if(!disableGetPosts) {
        this.getPosts(0);
      }
    }
  }
});
