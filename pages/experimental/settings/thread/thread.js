var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    settings: data.threadSettings,
    roles: data.roles,
    grades: data.grades
  },
  methods:  {
    save: function() {
      nkcAPI("/e/settings/thread", "PATCH", {threadSettings: this.settings})
        .then(function() {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    }
  }
});