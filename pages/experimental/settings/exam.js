var app = new Vue({
  el: '#app',
  data: {
    examSettings: {},
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    var settings = data.examSettings;
    var examSettings = {};
    examSettings.count = settings.count || 0;
    examSettings.countOneDay = settings.countOneDay || 0;
    examSettings.waitingTime = settings.waitingTime || 0;
    examSettings.examNotes = settings.examNotes || "";
    this.examSettings = examSettings;
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

window.app = app;