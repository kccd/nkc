var app = new Vue({
  el: '#app',
  data: {
    kcbsRecords: []
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerText);
    this.kcbsRecords = data.kcbsRecords;
    this.user = data.user;
  },
  methods: {
    format: format
  }
});