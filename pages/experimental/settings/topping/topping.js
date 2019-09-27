var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    toppingSettings: data.toppingSettings,
    roles: data.roles,
    grades: data.grades
  },
  methods: {
    submit: function() {
      var toppingSettings = this.toppingSettings;
      nkcAPI("/e/settings/topping", "PATCH", toppingSettings)
        .then(function() {
          sweetSuccess("保存成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});