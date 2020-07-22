var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    roleOptions: data.roleOptions,
    gradeOptions: data.gradeOptions
  },
  methods: {
    submit: function() {
      nkcAPI("/e/settings/download", "PUT", {
        options: this.roleOptions.concat(this.gradeOptions)
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
