var app = new Vue({
  el: '#app',
  data: {
    examsCategories: [],
    category: {},
    disabled: [],
    error: ''
  },
  mounted: function() {
    nkcAPI(window.location.href, 'GET', {})
      .then(function(data) {
        app.examsCategories = data.examsCategories;
        if(app.examsCategories.length === 0) {
          app.addCategory();
        } else {
          var selected = false;
          console.log(data.cid, typeof data.cid)
          if(data.cid) {
            for(var i = 0; i < app.examsCategories.length; i++) {
              if(app.examsCategories[i]._id === Number(data.cid)) {
                app.selectCategory(app.examsCategories[i]);
                selected = true;
                break;
              }
            }
          }
          if(!selected) {
            app.selectCategory(app.examsCategories[0]);
          }
        }
      })
      .catch(function(data) {
        screenTopWarning(data.error || data);
      });
  },
  methods: {
    addCategory: function() {
      this.category = {
        name: '',
        disabled: true,
        order: 100,
        description: ''
      }
    },
    saveCategory: function() {
      this.error = '';
      var category = JSON.parse(JSON.stringify(this.category));
      var method = 'PATCH';
      var url = '/exam/category/' + category._id;
      if(!this.category._id) {
        method = 'POST';
        url = '/exam/category';
      } else {
        category.disabledA = this.disabled.indexOf('A') === -1;
        category.disabledB = this.disabled.indexOf('B') === -1;
      }
      nkcAPI(url, method, {category: category})
        .then(function(data) {
          screenTopAlert('保存成功');
          if(method === 'POST') {
            app.examsCategories.push(data.category);
            app.selectCategory(data.category);
          } else {
            Vue.set(app.examsCategories, app.examsCategories.indexOf(app.category), data.category);
          }
        })
        .catch(function(data) {
          app.error = data.error || data;
        })
    },
    selectCategory: function(c) {
      this.disabled = [];
      if(!c.disabledA) {
        this.disabled.push('A');
      }
      if(!c.disabledB) {
        this.disabled.push('B');
      }
      this.category = c;
    },
    deleteCategory: function() {
      if(confirm('确认要删除该科目？') === false) return;
      nkcAPI('/exam/category/' + this.category._id, 'DELETE', {})
        .then(function() {
          window.location.reload()
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  }
});