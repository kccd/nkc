const data = NKC.methods.getDataById('data');
var app = new Vue({
  el: "#app",
  data: {
    user: "",
    code: "",
    password: "",

    succeed: false,
    submitted: false,
    timeLimit: 0,

    payment: 'aliPay',

    info: "",

    succeedMoney: 0,

    error: "",

    withdrawSettings: data.withdrawSettings,
    countToday: data.countToday,
    mainScore: data.mainScore,
    userMainScore: data.userMainScore,

    alipayAccounts: data.alipayAccounts,
    bankAccounts: data.bankAccounts,
    money: "",
    selectedAccount: "",
  },
  computed: {
    // 用户选择的提现平台对应的设置
    paymentSettings() {
      return this.withdrawSettings[this.payment]
    },
    // 用户需要提现的科创币金额 分
    paymentMoney() {
      return Math.ceil(this.money * 100);
    },
    // 用户实际到账金额 到账金额 = 支付金额 * （ 1 - 手续费 ）
    effectiveMoney() {
      return Math.floor(this.paymentMoney * (1 - this.fee));
    },
    // 用户选择的提现平台提现时收取的手续费
    fee() {
      return this.paymentSettings.fee;
    },
    timeBegin: function() {
      var timeBegin = this.getHMS(this.withdrawSettings.startingTime, "string");
      return timeBegin.hour + ":" + timeBegin.min + ":" + timeBegin.sec
    },
    timeEnd: function() {
      var timeEnd = this.getHMS(this.withdrawSettings.endTime, "string");
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
    },
    payments() {
      const arr = [];
      const {weChat, aliPay} = this.withdrawSettings;
      if(aliPay.enabled) arr.push({
        type: 'aliPay',
        name: '支付宝'
      });
      if(weChat.enabled) arr.push({
        type: 'weChat',
        name: '微信支付'
      });
      return arr;
    },
    payInfo() {
      const {fee} = this;
      if(fee > 0) {
        return `服务商（非本站）将收取 ${fee * 100}% 的手续费`
      }
    },
  },
  mounted: function() {
    for(var i = 0; i < this.alipayAccounts.length; i++) {
      var alipay = this.alipayAccounts[i];
      if(alipay.default) {
        this.selectedAccount = alipay;
        break;
      }
    }
    if(this.payments.length) {
      this.selectPayment(this.payments[0].type);
    }
  },
  methods: {
    // 处理用户输入的金额数，精确到分
    onInputMoney() {
      let money = Math.ceil(this.money * 100) / 100;
      if(isNaN(money)) money = 0;
      this.money = money;
    },
    selectAccount: function(account) {
      this.selectedAccount = account;
    },
    selectPayment: function(t) {
      this.payment = t;
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
          sweetError(err);
        })
    },
    submit: function() {
      this.error = "";
      this.info = "";
      const self = this;
      const {
        paymentMoney,
        effectiveMoney,
        fee,
        password,
        code,
        payment,
        selectedAccount,
        withdrawSettings
      } = this;
      Promise.resolve()
        .then(() => {
          const {min, max} = withdrawSettings;
          if(effectiveMoney < min) throw new Error(`提现金额不能小于 ${min / 100} 元`);
          if(effectiveMoney > max) throw new Error(`提现金额不能大于 ${max / 100} 元`);
          if(!['aliPay', 'weChat'].includes(payment)) throw new Error('请选择付款方式');
          if(!code) throw new Error('请输入短信验证码');
          if(!password) throw new Error('请输入登录密码');
          self.submitted = true;
          return nkcAPI(`/account/finance/withdraw`, 'POST', {
            money: paymentMoney,
            effectiveMoney,
            fee,
            password,
            code,
            account: selectedAccount,
            payment
          })

        })
        .then(() => {
          self.submitted = false;
          self.password = '';
          self.money = '';
          return sweetSuccess('提现成功');
        })
        .catch(err => {
          sweetError(err);
          self.submitted = false;
        });
    }
  }
});
