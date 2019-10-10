var data = NKC.methods.getDataById("data");
if(data.hidePostSettings.postHeight.float === undefined) {
  data.hidePostSettings.postHeight.float = 0.5;
}
var app = new Vue({
  el: "#app",
  data: {
    roles: data.roles,
    grades: data.grades,
    hidePostSettings: data.hidePostSettings
  },
  methods: {
    submit: function() {
      nkcAPI("/e/settings/hidePost", "POST", {
        hidePostSettings: this.hidePostSettings
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
