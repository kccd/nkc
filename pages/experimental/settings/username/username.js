var data = NKC.methods.getDataById("data");
data.usernameSettings.maxKcb = data.usernameSettings.maxKcb/100;
data.usernameSettings.onceKcb = data.usernameSettings.onceKcb/100;
var app = new Vue({
  el: "#app",
  data: {
    usernameSettings: data.usernameSettings
  },
  methods: {
    submit: function() {
      var us = this.usernameSettings;
      if(us.freeCount < 0) return sweetError("免费修改次数不能小于0");
      if(us.onceKcb < 0) return sweetError("花费科创币增量不能小于0");
      if(us.maxKcb < 0) return sweetError("花费科创币最大值不能小于0");
      us = {
        onceKcb: us.onceKcb * 100,
        maxKcb: us.maxKcb * 100,
        freeCount: us.freeCount,
        free: !!us.free
      };
      nkcAPI("/e/settings/username", "PATCH", us)
        .then(function() {
          sweetSuccess("保存成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});