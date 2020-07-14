const data = NKC.methods.getDataById('data');
const math = NKC.modules.math;
let defaultKCB = [10, 20, 50, 100, 500, 1000, 5000];
var app = new Vue({
  el: '#app',
  data: {
    defaultKCB: defaultKCB.filter(d => {
      return (
        d >= data.rechargeSettings.min / 100 && d <= data.rechargeSettings.max / 100
      );
    }),
    money: 10,
    error: '',
    payment: '',
    input: '',
    mainScore: data.mainScore,
    rechargeSettings: data.rechargeSettings,
  },
  computed: {
    payments() {
      const arr = [];
      const {weChat, aliPay} = this.rechargeSettings;
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
      const {payment, rechargeSettings} = this;
      if(!payment) return;
      const pay = rechargeSettings[payment];
      if(pay.enabled && pay.fee > 0) {
        const fee = math.chain(math.bignumber(pay.fee)).multiply(100).done().toNumber();
        return `服务商（非本站）将收取 ${fee}% 的手续费`
      }
    },
    fee() {
      const {totalPrice, finalPrice} = this;
      if(totalPrice) {
        return Number((totalPrice - finalPrice).toFixed(2));
      }
    },
    finalPrice() {
      const {money, input} = this;
      let m = input;
      if(money !== '') {
        m = money;
      }
      if(m) {
        m = m.toFixed(2);
        return Number(m);
      }
    },
    totalPrice() {
      const {payment, rechargeSettings} = this;
      const pay = rechargeSettings[payment];
      if(pay) {
        if(this.finalPrice) {
          let fee = this.finalPrice / (1 - pay.fee);
          fee = fee.toFixed(2);
          return Number(fee);
        }
      }
    }
  },
  mounted() {
    if(this.payments.length) {
      this.selectPayment(this.payments[0].type);
    }
  },
  methods: {
    select: function(m) {
      this.money = m;
    },
    selectPayment: function(t) {
      this.payment = t;
    },
    pay: function() {
      const {totalPrice, payment, finalPrice} = this;
      let newWindow;
      Promise.resolve()
        .then(() => {
          if(!['aliPay', 'weChat'].includes(payment)) throw '请选择支付方式';
          if(totalPrice > 0) {}
          else {
            throw '充值金额必须大于0';
          }
          if(NKC.configs.platform !== 'reactNative') {
            newWindow = window.open();
          }
          return nkcAPI(`/account/finance/recharge?type=get_url&money=${totalPrice}&score=${finalPrice}&payment=${payment}`, 'GET');
        })
        .then(data => {
          if(NKC.configs.platform === 'reactNative') {
            NKC.methods.visitUrl(data.url, true);
          } else {
            newWindow.location = data.url;
          }
          sweetInfo('请在浏览器新打开的窗口完成支付！若没有新窗口打开，请检查新窗口是否已被浏览器拦截。');
        })
        .catch(err => {
          sweetError(err)
          if(newWindow) {
            newWindow.document.body.innerHTML = err.error || err;
          }
        });
    }
  }
});
