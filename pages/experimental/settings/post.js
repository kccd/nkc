var app = new Vue({
  el: '#app',
  data: {
    roles: [],
    grades: []
  },
  methods: {
    submit: function() {
      var obj = {
        roles: app.roles,
        grades: app.grades
      };
      nkcAPI('/e/settings/post', 'PATCH', obj)
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  },
  mounted: function() {
    nkcAPI('/e/settings/post', 'GET', {})
      .then(function(data) {
        app.roles = data.roles;
        app.grades = data.grades;
      })
      .catch(function(data) {
        screenTopWarning(data.error || data);
      });
  }
});
