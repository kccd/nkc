var data = NKC.methods.getDataById("data");
var SelectUser = new NKC.modules.SelectUser();
data.transferSettings.kcbOnce = data.transferSettings.kcbOnce / 100;
var app = new Vue({
  el: "#app",
  data: {
    error: '',
    password: "",
    submitting: false,
    num: 1,
    transferSettings: data.transferSettings,
    enabledScores: data.enabledScores,
    shopScore: data.shopScore,
    from: {
      type: "bank", // bank, user,
      user: ""
    },
    to: {
      type: "user",
      user: ""
    },
    scoreType: 'score1'
  },
  computed: {
    warning: function() {
      var from = this.from;
      var to = this.to;
      if(from.type === "user" && !from.user) {
        return "未指定支付方用户"
      }
      if(to.type === "user" && !to.user) {
        return "未指定收款方用户"
      }
      if(
        (from.type === "bank" && to.type === "bank") ||
        (from.type === "user" && to.type === "user" && to.user.uid === from.user.uid)
      ) return "支付方和收款方不能相同";
      if(!this.password) return "请输入登录密码"
    }
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    format: NKC.methods.format,
    visitUrl: NKC.methods.visitUrl,
    getUrl: NKC.methods.tools.getUrl,
    checkNumber: NKC.methods.checkData.checkNumber,
    saveTransferSettings: function() {
      var checkNumber = this.checkNumber;
      var transferSettings = this.transferSettings;
      var shopScore = this.shopScore;

      Promise.resolve()
        .then(function() {
          checkNumber(transferSettings.kcbOnce, {
            name: "单次转账"+shopScore.name+"上限",
            min: 0,
            fractionDigits: 2
          });
          checkNumber(transferSettings.countOneDay, {
            name: "每天转账总次数上限",
            min: 0
          });
          checkNumber(transferSettings.countToUserOneDay, {
            name: "对同一用户每天转账次数上限",
            min: 0
          });
          return nkcAPI("/e/settings/transfer", "PUT", {
            transferSettings: transferSettings
          });
        })
        .then(function() {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    },
    getUser: function(t) {
      SelectUser.open(function(data) {
        app[t].user = data.users[0];
      }, {
        userCount: 1
      });
    },
    submit: function() {
      this.error = "";
      this.submitting = true;
      nkcAPI("/e/settings/transfer", "POST", {
        from: this.from.type==="bank"?"bank": this.from.user.uid,
        to: this.to.type==="bank"?"bank": this.to.user.uid,
        password: this.password,
        scoreType: this.scoreType,
        num: this.num
      })
        .then(function(data) {
          sweetSuccess("操作成功");
          if(data.from) app.from.user = data.from;
          if(data.to) app.to.user = data.to;
          app.submitting = false;
          app.password = "";
        })
        .catch(function(data) {
          sweetError(data);
          app.submitting = false;
        })
    }
  }
});

Object.assign(window, {
  SelectUser,
  app,
});
