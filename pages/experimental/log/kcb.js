var app = new Vue({
  el: '#app',
  data: {
    kcbsRecords: [],
    now: ''
  },
  methods: {
    fromNow: fromNow,
    format: format,
  },
  mounted: function() {
    var data = JSON.parse(this.$refs.data.innerText);
    this.kcbsRecords = data.kcbsRecords;
    var this_ = this;
    this_.now = this_.format('YYYY/MM/DD HH:mm:ss', new Date());
    setInterval(function() {
      this_.now = this_.format('YYYY/MM/DD HH:mm:ss', new Date());
    }, 1000)
  }
});