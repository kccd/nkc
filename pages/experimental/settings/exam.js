var app = new Vue({
  el: '#app',
  data: {
    examSettings: ''
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    this.examSettings = data.examSettings;
  },
  methods: {
    save: function() {
      nkcAPI('/e/settings/exam', 'PUT', {examSettings: app.examSettings})
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    }
  }
});
