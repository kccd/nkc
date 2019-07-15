NKC.modules.SelectColumnCategories = function() {
  var this_ = this;
  this_.dom = $("#moduleSelectColumnCategories");
  this_.columnId = this_.dom.attr("data-column-id");
  var toColumn = !!this_.dom.attr("data-to-column");
  this_.app = new Vue({
    el: "#moduleSelectColumnCategories",
    data: {
      loaded: false,
      choose: toColumn?[true]:[],
      categories: [],
      selectedCategoriesId: [],

      error: "",
      createCategory: false,
      newCategory: {
        parentId: "",
        name: "",
        description: ""
      },
    },
    methods: {
      getCategoryById: function(_id) {
        for(var i = 0; i < this.categories.length; i++) {
          if(this.categories[i]._id === _id) return this.categories[i];
        }
      },
      getCategories: function() {
        nkcAPI("/m/" + this_.columnId + "/category?t=list", "GET")
          .then(function(data) {
            this_.app.loaded = true;
            for(var i = 0; i < data.categories.length; i++) {
              var c = data.categories[i];
              var str = "";
              for(var j = 0; j < c.level; j++) {
                str += "&nbsp;&nbsp;&nbsp;";
              }
              c.str = str;
            }
            this_.app.categories = data.categories;
          })
          .catch(function(data) {
            this_.app.loaded = true;
            sweetError(data);
          });
      },
      saveCategory: function() {
        var app = this;
        this.error = "";
        var category = this.newCategory;
        if(!category.name) return this.error = "请输入分类名";
        if(!category.description) return this.error = "请输入分类介绍";
        nkcAPI("/m/" + this_.columnId + "/category", "POST", category)
          .then(function() {
            app.getCategories();
            app.createCategory = false;
            app.newCategory = {
              name: "",
              description: "",
              parentId: ""
            };
          })
          .catch(function(data) {
            sweetError(data);
          });
      },
      addCategory: function() {
        this.createCategory = true;
      },
      cancelAddCategory: function() {
        this.createCategory = false;
      },
    },
    computed: {
      selectedCategories: function() {
        var arr = [];
        for(var i = 0; i < this.selectedCategoriesId.length; i++) {
          var c = this.getCategoryById(this.selectedCategoriesId[i]);
          if(c) arr.push(c);
        }
        return arr;
      }
    },
    watch: {
      choose: function() {
        if(this.choose.length > 0 && this.categories.length === 0) {
          this.getCategories();
        } else {
          this_.app.loaded = false;
          this_.app.categories = [];
          this_.app.selectedCategoriesId = [];
        }
      }
    }
  });
  this_.getStatus = function() {
    return {
      selectedCategories: this_.app.selectedCategories,
      selectedCategoriesId: this_.app.selectedCategoriesId,
      checkbox: this_.app.choose.length > 0
    }
  };
};