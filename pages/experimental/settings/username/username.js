var data = NKC.methods.getDataById("data");
data.usernameSettings.maxKcb = data.usernameSettings.maxKcb/100;
data.usernameSettings.onceKcb = data.usernameSettings.onceKcb/100;
data.usernameSettings.sensitive.words = data.usernameSettings.sensitive.words.join(', ');
var app = new Vue({
  el: "#app",
  data: {
    usernameSettings: data.usernameSettings,
    scoreObject: data.scoreObject,
    scoreName: data.scoreObject.name
  },
  methods: {
    submit: function() {
      var us = this.usernameSettings;
      if(us.freeCount < 0) return sweetError("免费修改次数不能小于0");
      if(us.onceKcb < 0) return sweetError("花费"+scoreName+"增量不能小于0");
      if(us.maxKcb < 0) return sweetError("花费"+scoreName+"最大值不能小于0");

      const words = [];
      for(const w of this.usernameSettings.sensitive.words.split(',')) {
        for(let word of w.split('，')) {
          word = word.trim();
          if(word && !words.includes(word)) words.push(word);
        }
      }

      const {usernameTip, descTip} = this.usernameSettings.sensitive;

      if(usernameTip === '') return sweetError('非法用户名提示不能为空');
      if(descTip === '') return sweetError('非法用户简介提示不能为空');

      us = {
        onceKcb: us.onceKcb * 100,
        maxKcb: us.maxKcb * 100,
        freeCount: us.freeCount,
        free: !!us.free,
        sensitive: {
          words,
          usernameTip,
          descTip,
        }
      };
      nkcAPI("/e/settings/username", "PUT", us)
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
