var app;
$(function() {
  var data = NKC.methods.getDataById("data");
  for(var i = 0; i < data.warnings.length; i++) {
    data.warnings[i].modify = false;
  }
  app = new Vue({
    el: "#app",
    data: {
      warnings: data.warnings
    },
    methods: {
      format: NKC.methods.format,
      fromNow: NKC.methods.fromNow,
      save: function(warning) {
        if(!warning.reason) return screenTopWarning("修改建议不能为空");
        nkcAPI("/p/" + warning.pid + "/warning", "PUT", {
          reason: warning.reason,
          warningId: warning._id
        })
          .then(function() {
            screenTopAlert("保存成功");
          })
          .catch(function(data) {
            screenTopWarning(data);
          })
      }
    }
  });
});
