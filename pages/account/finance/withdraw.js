var app = new Vue({
  el: "#app",
  data: {
    user: "",
    code: "",
    password: "",

    succeed: false,
    submitted: false,
    timeLimit: 0,

    info: "",

    succeedMoney: 0,

    error: "",

    withdrawSettings: {},
    countToday: 0,

    alipayAccounts: [],
    bankAccounts: [],
    money: "",
    selectedAccount: "",
    to: "alipay" // alipay, bank
  },
  computed: {
    realMoney: function() {
      return (this.money*(1-this.withdrawSettings.withdrawFee)).toFixed(2)
    },
    timeBegin: function() {
      var timeBegin = this.getHMS(this.withdrawSettings.withdrawTimeBegin, "string");
      return timeBegin.hour + ":" + timeBegin.min + ":" + timeBegin.sec
    },
    timeEnd: function() {
      var timeEnd = this.getHMS(this.withdrawSettings.withdrawTimeEnd, "string");
      return timeEnd.hour + ":" + timeEnd.min + ":" + timeEnd.sec
    },
    outTime: function() {
      var now = new Date();
      var sec = now.getHours()*60*60*1000 + now.getMinutes()*60*1000 + now.getSeconds()*1000;
      if(sec < this.withdrawSettings.withdrawTimeBegin || sec > this.withdrawSettings.withdrawTimeEnd) {
        return true;
      }
    },
    count: function() {
      return this.withdrawSettings.withdrawCount - this.countToday
    }
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(data.innerHTML);
    this.alipayAccounts = data.alipayAccounts;
    this.withdrawSettings = data.withdrawSettings;
    this.bankAccounts = data.bankAccounts;
    this.user = data.user;
    this.countToday = data.countToday;
    for(var i = 0; i < this.alipayAccounts.length; i++) {
      var alipay = this.alipayAccounts[i];
      if(alipay.default) {
        this.selectedAccount = alipay;
        break;
      }
    }
  },
  methods: {
    selectAccount: function(account) {
      this.selectedAccount = account;
    },
    getHMS: function(t, type) {
      var hour = Math.floor(t/3600000);
      var min = Math.floor(t/60000) % 60;
      var sec = Math.floor(t/1000) % 60;
      if(type === "string") {
        if(hour < 10) hour = "0" + hour;
        if(min < 10) min = "0" + min;
        if(sec < 10) sec = "0" + sec;
      }
      return {
        hour: hour,
        min: min,
        sec: sec
      }
    },
    countdown: function() {
      if(app.timeLimit <= 0) return;
      app.timeLimit --;
      setTimeout(function() {
        app.countdown();
      }, 1000);
    },
    sendMessage: function() {
      nkcAPI("/sendMessage/withdraw", "POST", {})
        .then(function() {
          app.timeLimit = 120;
          app.countdown();
          screenTopAlert("短信验证码发送成功");
        })
        .catch(function(err) {
          app.error = err.error || err;
        })
    },
    submit: function() {
      this.error = "";
      this.info = "";
      var money = this.money;
      var password = this.password;
      var code = this.code;
      if(!money || money <= 0) return this.error = "请输入正确的提现金额";
      if(!code) return this.error = "请输入短信验证码";
      if(!password) return this.error = "请输入登录密码";
      if(this.submitted) return;
      this.submitted = true;
      nkcAPI("/account/finance/withdraw", "POST", {
        money: parseInt(money * 100),
        password: password,
        code: code,
        to: this.to,
        account: this.selectedAccount
      })
        .then(function(data) {
          app.user = data.user;
          app.succeedMoney = money;
          app.succeed = true;
          app.submitted = false;
        })
        .catch(function(data) {
          app.error = data.error || data;
          app.submitted = false;
        });
    }
  }
});