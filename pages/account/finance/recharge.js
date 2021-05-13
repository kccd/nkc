const data = NKC.methods.getDataById('data');
const math = NKC.modules.math;
let defaultKCB = [10, 20, 50, 100, 500];
window.rechargeApp = new Vue({
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
        return totalPrice - finalPrice;
      }
    },
    finalPrice() {
      const {money, input} = this;
      let m = 0;
      if(input) {
        m = input;
      } else if(money) {
        m = money;
      }
      if(m) {
        m = Math.ceil(m * 100);
      }
      return m;
    },
    totalPrice() {
      let fee = 0;
      const {payment, rechargeSettings} = this;
      const pay = rechargeSettings[payment];
      if(pay) {
        if(this.finalPrice) {
          fee = this.finalPrice * (1 + pay.fee);
          fee = Math.ceil(fee);
        }
      }
      return fee;
    },
  },
  mounted() {
    if(this.payments.length) {
      this.selectPayment(this.payments[0].type);
    }
  },
  methods: {
    inputNumber() {
      this.input = parseFloat(this.input.toFixed(2));
    },
    select: function(m) {
      this.money = m;
    },
    selectPayment: function(t) {
      this.payment = t;
    },
    toPay: function() {
      const {payment, finalPrice, totalPrice, rechargeSettings} = this;
      const {min, max} = rechargeSettings;
      const self = this;
      let appType;
      if(NKC.configs.platform === 'reactNative') {
        appType = 'app';
      } else if(NKC.methods.isMobilePhoneBrowser()) {
        appType = 'mobilePhoneBrowser';
      } else {
        appType = 'pcBrowser';
      }
      let newWindow;
      return Promise.resolve()
        .then(() => {
          if(totalPrice < min) {
            throw new Error(`充值金额不能小于${min / 100}元`);
          }
          if(totalPrice > max) {
            throw new Error(`充值金额不能大于${max / 100}元`);
          }
          if(['pcBrowser', 'mobilePhoneBrowser'].includes(appType)) {
            newWindow = window.open();
          }
          return nkcAPI('/account/finance/recharge/payment', 'POST', {
            apiType: appType === 'pcBrowser'? 'native': 'H5',
            paymentType: payment,
            totalPrice,
            finalPrice
          });
        })
        .then(res => {
          const {weChatPaymentInfo, aliPaymentInfo} = res;
          if(weChatPaymentInfo) {
            const url = `/payment/wechat/${weChatPaymentInfo.paymentId}`;
            if(payment === 'weChat') {
              if(appType === 'pcBrowser') {
                newWindow.location = url;
              } else if(appType === 'mobilePhoneBrowser') {
                newWindow.location = weChatPaymentInfo.url;
              } else {
                NKC.methods.rn.emit('weChatPay', {
                  url: window.location.origin + url,
                  H5Url: weChatPaymentInfo.url,
                  referer: window.location.origin
                  // referer: 'https://www.kechuang.org'
                });
              }
            }
          } else {
            if(appType === 'app') {
              NKC.methods.visitUrl(aliPaymentInfo.url, true);
            } else {
              newWindow.location = aliPaymentInfo.url;
            }
          }
          sweetInfo('请在浏览器新打开的窗口完成支付！若没有新窗口打开，请检查新窗口是否已被浏览器拦截。');
        })
        .catch(err => {
          sweetError(err);
          if(newWindow) {
            newWindow.document.body.innerHTML = err.error || err;
          }
        })
    },
    pay: function() {
      const {totalPrice, payment, finalPrice} = this;
      let newWindow;
      let redirect = false;
      const isPhone = NKC.methods.isPhone();
      let url = `/account/finance/recharge?type=get_url&money=${totalPrice}&score=${finalPrice}&payment=${payment}`;
      Promise.resolve()
        .then(() => {
          if(!['aliPay', 'weChat'].includes(payment)) throw '请选择支付方式';
          if(totalPrice > 0) {}
          else {
            throw '充值金额必须大于0';
          }
          if(NKC.configs.platform !== 'reactNative') {
            if(isPhone) {
              url += '&redirect=true';
              screenTopAlert('正在前往支付宝...')
              redirect = true;
              return window.location.href = url;
            } else {
              newWindow = window.open();
            }
          }
          return nkcAPI(url, 'GET');
        })
        .then(data => {
          if(redirect) return;
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
