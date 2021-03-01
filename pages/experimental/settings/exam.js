var editor = new wangEditor('#editor');
editor.config.zIndex = 1;
editor.config.excludeMenus = ["video", "code", "splitLine"];
editor.config.placeholder = "请在此编辑考试须知";
editor.config.onchange = function(newHtml) {
  app.examSettings.examNotes = newHtml;
}

var app = new Vue({
  el: '#app',
  data: {
    examSettings: {},
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    var settings = data.examSettings;
    console.log(settings);
    var examSettings = {};
    examSettings.count = settings.count || 0;
    examSettings.countOneDay = settings.countOneDay || 0;
    examSettings.waitingTime = settings.waitingTime || 0;
    examSettings.examNotes = settings.examNotes || "";
    this.examSettings = examSettings;
    editor.create();
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
