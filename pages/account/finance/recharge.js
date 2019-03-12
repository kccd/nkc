var app = new Vue({
  el: '#app',
  data: {
    defaultKCB: [10, 20, 50, 100, 1000],
    money: '',
    input: ''
  },
  methods: {
    select: function(m) {
      this.money = m;
    }
  }
});