var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    downloadSettings: data.downloadSettings,
    roleOptions: data.roleOptions,
    gradeOptions: data.gradeOptions
  },
  methods: {
    submit: function() {
      nkcAPI("/e/settings/download", "PUT", {
        options: this.roleOptions.concat(this.gradeOptions),
        allSpeed: this.downloadSettings.allSpeed
      })
        .then(function() {
          sweetSuccess("保存成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});

window.app = app;
