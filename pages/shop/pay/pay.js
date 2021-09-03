const data = NKC.methods.getDataById('data');
const {aliPay, weChat} = data.rechargeSettings;
const app = new Vue({
  el: '#app',
  data: {
    rechargeSettings: data.rechargeSettings,
    userMainScore: data.userMainScore,
    mainScore: data.mainScore,
    totalMoney: data.totalMoney,
    ordersId: data.ordersId,
    payment: 'mainScore',
    aliPay,
    weChat,
    password: '',

    submitting: false,
  },
  computed: {
    fee() {
      const {payment} = this;
      if(payment === 'mainScore') return 0;
      const {fee} = this.rechargeSettings[payment];
      return fee;
    },
    // 总金额 分（包含手续费）
    totalPrice() {
      return Math.ceil(this.totalMoney * (1 + this.fee));
    },
    needRecharge() {
      const {userMainScore, totalMoney} = this;
      return userMainScore < totalMoney;
    },
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    selectPayment(type) {
      this.payment = type;
    },
    submit() {
      const {password, ordersId, totalMoney} = this;
      const self = this;
      Promise.resolve()
        .then(() => {
          if(!password) throw '请输入登录密码';
          return nkcAPI('/shop/pay', 'POST', {
            ordersId,
            password,
            totalPrice: totalMoney
          });
        })
        .then(() => {
          sweetSuccess('支付成功');
          self.password = '';
          setTimeout(() => {
            NKC.methods.visitUrl('/shop/order');
          }, 2000);
        })
        .catch(sweetError);
    },
    useAliPay() {
      const {payment, ordersId, totalPrice, totalMoney} = this;
      let newWindow = null;
      const self = this;
      return Promise.resolve()
        .then(() => {
          self.submitting = true;
          if(
            NKC.methods.isPcBrowser() ||
            NKC.methods.isMobilePhoneBrowser()
          ) {
            newWindow = window.open();
          }
          return nkcAPI(`/account/finance/recharge/payment`, 'POST', {
            apiType: NKC.methods.isPcBrowser()? 'native': 'H5',
            ordersId,
            paymentType: payment,
            finalPrice: totalMoney,
            totalPrice,
          });
        })
        .then((res) => {
          const {aliPaymentInfo, wechatPaymentInfo} = res;
          if(wechatPaymentInfo) {
            NKC.methods.toPay('wechatPay', wechatPaymentInfo, newWindow);
          } else {
            NKC.methods.toPay('aliPay', aliPaymentInfo, newWindow);
          }
          sweetInfo('请在浏览器新打开的窗口完成支付！若没有新窗口打开，请检查新窗口是否已被浏览器拦截。');
          self.submitting = false;
        })
        .catch(err => {
          self.submitting = false;
          if(newWindow && newWindow.close) newWindow.close();
          sweetError(err);
        });
    }
  }
});

window.app = app;
