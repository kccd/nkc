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
      kcAPI('/account/finance/recharge?type=get_url&money=' + money, 'GET')
        .then(function(data) {
          alert(data.url);
        })
        .catch(function(data) {
          this.error = data.error || data;
        });
    }
  }
});