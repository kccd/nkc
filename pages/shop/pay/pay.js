const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    rechargeSettings: data.rechargeSettings,
    userMainScore: data.userMainScore,
    mainScore: data.mainScore,
    totalMoney: data.totalMoney,
    ordersId: data.ordersId,
    payment: 'mainScore',
    password: '',
  },
  computed: {
    aliPay() {
      const a = this.rechargeSettings.aliPay;
      let totalPrice = this.totalMoney / (1 - a.fee);
      let feePrice = totalPrice - this.totalMoney;
      return {
        enabled: a.enabled,
        fee: a.fee,
        _fee: Number((a.fee * 100).toFixed(4)),
        totalPrice: Number((totalPrice.toFixed(2))),
        feePrice: Number(feePrice.toFixed(2))
      };
    },
    weChat() {
      return this.rechargeSettings.weChat;
    },
    needRecharge() {
      const {userMainScore, totalMoney} = this;
      return userMainScore / 100 < totalMoney;
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
          }, 3000);
        })
        .catch(sweetError);
    },
    useAliPay() {
      const {ordersId, aliPay} = this;
      const {totalPrice, feePrice} = aliPay;
      let url = `/shop/pay/alipay?ordersId=${ordersId}&money=${totalPrice}`;
      const isPhone = NKC.methods.isPhone();
      let newWindow;
      if(NKC.configs.platform !== 'reactNative') {
        if(isPhone) {
          url += '&redirect=true';
          screenTopAlert('正在前往支付宝...');
          return window.location.href = url;
        } else {
          newWindow = window.open();
        }
      }
      Promise.resolve()
        .then(() => {
          return nkcAPI(url, 'GET')
            .then(data => {
              if(NKC.configs.platform === 'reactNative') {
                NKC.methods.visitUrl(data.alipayUrl, true);
              } else {
                newWindow.location = data.alipayUrl;
              }
              sweetInfo('请在浏览器新打开的窗口完成支付！若没有新窗口打开，请检查新窗口是否已被浏览器拦截。');
            })
            .catch(err => {
              sweetError(err);
              if(newWindow) {
                newWindow.document.body.innerHTML = err.error || err;
              }
            });
        })
    }
  }
});

window.app = app;
