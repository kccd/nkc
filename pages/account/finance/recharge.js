var app = new Vue({
  el: '#app',
  data: {
    defaultKCB: [10, 20, 50, 100, 500, 1000, 5000],
    money: 10,
    error: '',
    payment: 'alipay',
    input: ''
  },
  methods: {
    select: function(m) {
      this.money = m;
    },
    pay: function() {
      this.error = '';
      var money = 0;
      if(this.money) {
        money = this.money;
      } else {
        money = this.input;
      }
      if(money > 0){}
      else {
        return this.error = '充值数额必须大于0';
      }
      var newWindow;
      if(NKC.configs.platform !== 'reactNative') {
        newWindow = window.open();
      }
      nkcAPI('/account/finance/recharge?type=get_url&money=' + money, 'GET')
        .then(function(data) {
          if(NKC.configs.platform === 'reactNative') {
            NKC.methods.visitUrl(data.url, true);
          } else {
            newWindow.location = data.url;
          }
          app.error = '请在浏览器新打开的窗口完成支付！若没有新窗口打开，请检查新窗口是否已被浏览器拦截。'
        })
        .catch(function(data) {
          app.error = data.error || data;
          newWindow.document.body.innerHTML = data.error || data;
        });
    }
  }
});
